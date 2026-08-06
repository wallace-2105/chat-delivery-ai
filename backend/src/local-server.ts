/**
 * Servidor de desenvolvimento local — substitui AWS API Gateway + Lambda + Step Functions.
 *
 * Expõe as mesmas rotas do template.yaml sem precisar de Docker, AWS CLI ou conta AWS.
 *
 * Endpoints:
 *   POST /orders   — prévia ou confirmação de pedido
 *   GET  /orders   — histórico (aceita ?limit=N&cursor=X&pagination=true)
 *   GET  /orders/:id — pedido individual
 *   GET  /dashboard — métricas e série temporal dos últimos 7 dias
 *
 * Uso:
 *   npm run dev    (tsx watch — reinicia ao salvar)
 *   npm start      (tsx — executa uma vez)
 */

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

import { catalog } from "./domain/catalog.js";
import type {
  Order,
  OrderSummary,
  WorkflowInput,
} from "./domain/order.js";
import { LibSQLOrdersRepository } from "./local/sqlite-store.js";
import { parseFallback } from "./local/bedrock-fallback.js";
import { handleConversation } from "./local/conversation-handler.js";

// ─── Configuração ─────────────────────────────────────────────────────────
const PORT = Number(process.env["PORT"] ?? 3001);
const ALLOWED_ORIGIN = process.env["ALLOWED_ORIGIN"] ?? "http://localhost:8080";

// ─── Repositório SQLite (substitui DynamoDB + memória RAM) ────────────────
// Persiste dados entre reinicializacões localmente em orders.db
// Em produção usa Turso via DATABASE_URL
const repo = new LibSQLOrdersRepository();
// Seed assíncrono — não bloqueia o servidor
repo.seed().catch((e: unknown) => console.error("[db] Erro no seed:", e));

// ─── Helpers de preço e resposta ──────────────────────────────────────────
const money = (v: number) => Math.round(v * 100) / 100;

function buildSummary(
  items: OrderSummary["items"],
  deliveryFee = 7.9,
): OrderSummary {
  const subtotal = money(items.reduce((t, i) => t + i.unitPrice * i.quantity, 0));
  return { items, subtotal, deliveryFee, total: money(subtotal + deliveryFee) };
}
// ─── Helpers de carrinho ─────────────────────────────────────────────────

/** Mescla itens novos com o carrinho existente (mesmo SKU → soma quantidade) */
function mergeCart(
  existing: OrderSummary["items"],
  added: Array<{ sku: string; quantity: number; name: string; unitPrice: number }>,
): OrderSummary["items"] {
  const cart = existing.map((i) => ({ ...i })); // cópia
  for (const newItem of added) {
    const found = cart.find((c) => c.id === newItem.sku);
    if (found) {
      found.quantity += newItem.quantity; // mesmo item → soma
    } else {
      cart.push({ id: newItem.sku, name: newItem.name, quantity: newItem.quantity, unitPrice: newItem.unitPrice });
    }
  }
  return cart;
}

const CLEAR_CART_PATTERNS = [
  /limpar\s+(o\s+)?carrinho/i,
  /cancelar\s+(o\s+)?pedido/i,
  /zerar\s+(o\s+)?carrinho/i,
  /recomeç[ao]r|começ[ao]r\s+de\s+novo|pedido\s+novo/i,
  /apag[ao]r\s+(tudo|o\s+carrinho)/i,
];

const REMOVE_ITEM_PATTERNS = [
  /remov[ae]r?\s+(.+)/i,
  /tir[ao]r?\s+(.+)/i,
  /retir[ao]r?\s+(.+)/i,
  /n[aã]o\s+quero\s+(mais\s+)?(.+)/i,
  /sem\s+(.+)/i,
];

function detectClearCart(text: string): boolean {
  return CLEAR_CART_PATTERNS.some((p) => p.test(text));
}

function detectRemoveItem(
  text: string,
  currentSummary: OrderSummary,
): { newSummary: OrderSummary; removedName: string } | null {
  for (const pattern of REMOVE_ITEM_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    // O grupo de captura pode ser 1 ou 2 dependendo do padrão
    const searchText = (match[2] ?? match[1] ?? "").trim().toLowerCase();
    if (!searchText) continue;

    const itemToRemove = currentSummary.items.find((item) => {
      const product = catalog.find((c) => c.id === item.id);
      const nameMatch = item.name.toLowerCase().includes(searchText);
      const aliasMatch = product?.aliases.some(
        (a) => a.toLowerCase().includes(searchText) || searchText.includes(a.toLowerCase()),
      ) ?? false;
      return nameMatch || aliasMatch;
    });

    if (itemToRemove) {
      const newItems = currentSummary.items.filter((i) => i.id !== itemToRemove.id);
      return { newSummary: buildSummary(newItems), removedName: itemToRemove.name };
    }
  }
  return null;
}


async function runWorkflow(input: WorkflowInput) {
  // 1. InterpretOrder — resolver itens a partir do prompt ou summary
  let parsedItems: Array<{ sku: string; quantity: number }>;

  if (input.action === "confirm" && input.summary) {
    parsedItems = input.summary.items.map(({ id, quantity }) => ({
      sku: id,
      quantity,
    }));
  } else {
    if (!input.prompt?.trim()) throw new Error("Descreva o pedido para continuar.");

    // Tentar Bedrock se configurado, senão usar fallback por aliases
    const modelId = process.env["BEDROCK_MODEL_ID"];
    if (modelId) {
      try {
        const { parseNaturalLanguageOrder } = await import(
          "./services/bedrock-order-parser.js"
        );
        parsedItems = await parseNaturalLanguageOrder(input.prompt);
      } catch {
        console.info("[local] Bedrock falhou — usando parser de fallback.");
        parsedItems = parseFallback(input.prompt);
      }
    } else {
      parsedItems = parseFallback(input.prompt);
    }
  }

  // 2. ValidateProducts
  const invalidItems = parsedItems
    .filter((item) => !catalog.some((p) => p.sku === item.sku))
    .map((item) => item.sku);

  const resolvedNew = parsedItems.flatMap((item) => {
    const p = catalog.find((c) => c.sku === item.sku);
    return p
      ? [{ id: p.id, name: p.name, quantity: item.quantity, unitPrice: p.unitPrice }]
      : [];
  });

  if (!resolvedNew.length && !invalidItems.length) invalidItems.push("nenhum produto reconhecido");

  // ProductExists?
  if (invalidItems.length > 0) {
    throw new Error(
      `Um ou mais produtos não constam no catálogo: ${invalidItems.join(", ")}.`,
    );
  }

  // ── Mesclar com carrinho existente ─────────────────────────────────────
  const resolvedNewForMerge = resolvedNew.map((i) => ({ ...i, sku: i.id }));
  const existingCartItems = input.action === "confirm"
    ? resolvedNew  // na confirmação já tem tudo
    : mergeCart(input.currentSummary?.items ?? [], resolvedNewForMerge);

  const items = existingCartItems;

  // 3. CalculatePrice
  const summary = buildSummary(items);
  const createdAt = new Date().toISOString();

  // Resposta mencionando o total acumulado do carrinho
  const newItemList = resolvedNew.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  const totalLine = `Total do carrinho: R$ ${summary.total.toFixed(2).replace(".", ",")}`;
  const endings = [
    "Quer adicionar mais alguma coisa?",
    "Posso incluir mais algum item?",
    "Ficou faltando alguma coisa?",
    "Quer uma sobremesa ou bebida?",
  ];
  const ending = endings[Math.floor(Math.random() * endings.length)];
  const openingOptions = [
    `Adicionei ${newItemList}! 🛒 ${totalLine}. ${ending}`,
    `Anotado! ${newItemList} no carrinho. ${totalLine}. ${ending}`,
    `Perfeito, adicionei ${newItemList}. ${totalLine}. ${ending}`,
  ];
  const content = openingOptions[Math.floor(Math.random() * openingOptions.length)];

  const message = {
    id: `m-${Date.now()}`,
    role: "assistant" as const,
    content,
    createdAt,
  };


  // IsConfirmation?
  if (input.action !== "confirm") {
    return { message, summary }; // ReturnPreview
  }

  // 4. SaveOrder
  const order: Order = {
    id: `DA-${randomUUID()}`,
    customer: input.customer ?? "Cliente",
    createdAt: new Date().toISOString(),
    status: "recebido",
    ...summary,
  };
  await repo.save(order);

  // 5. ConfirmOrder
  return { orderId: `#${order.id}` };
}

// ─── Express app ──────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN, methods: ["GET", "POST", "OPTIONS"] }));
app.use(express.json());

// POST /orders
app.post("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as {
      action?: "confirm";
      prompt?: string;
      currentSummary?: OrderSummary;
      summary?: OrderSummary;
      customer?: string;
    };

    const action = body.action === "confirm" ? "confirm" : "preview";
    const emptySummary: OrderSummary = { items: [], subtotal: 0, deliveryFee: 7.9, total: 0 };

    // ── Interceptar limpeza e remoção de itens ──────────────────────────
    const currentSummary = body.currentSummary ?? emptySummary;
    const prompt = (body.prompt ?? "").trim();


    if (detectClearCart(prompt)) {
      res.status(200).json({
        message: {
          id: `m-${Date.now()}`, role: "assistant",
          content: "Carrinho limpo! 🧹 Pode recomeçar o seu pedido quando quiser.",
          createdAt: new Date().toISOString(),
        },
        summary: emptySummary,
      });
      return;
    }

    const removeResult = detectRemoveItem(prompt, currentSummary);
    if (removeResult) {
      const remaining = removeResult.newSummary.items.length;
      const remainMsg = remaining > 0
        ? `Ainda no carrinho: ${removeResult.newSummary.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}. Total: R$ ${removeResult.newSummary.total.toFixed(2).replace(".", ",")}.`
        : "Seu carrinho está vazio agora.";
      res.status(200).json({
        message: {
          id: `m-${Date.now()}`, role: "assistant",
          content: `Removido: ${removeResult.removedName}. ✅ ${remainMsg}`,
          createdAt: new Date().toISOString(),
        },
        summary: removeResult.newSummary,
      });
      return;
    }

    // ── Interceptar saudações, cardápio e perguntas gerais ──────────────
    const conv = handleConversation(prompt);
    if (conv) {
      res.status(200).json({ message: conv, summary: currentSummary });
      return;
    }

    if (action === "preview" && !body.prompt?.trim()) {
      res.status(400).json({ message: "Informe o pedido em texto." });
      return;
    }
    if (action === "confirm" && !body.summary?.items.length) {
      res.status(400).json({ message: "Não é possível confirmar um pedido vazio." });
      return;
    }

    const result = await runWorkflow({
      action,
      prompt: body.prompt,
      currentSummary: body.currentSummary,
      summary: body.summary,
      customer: body.customer,
    });

    // ── Para confirmação, enriquecer a resposta com resumo de pagamento ──
    if (action === "confirm" && "orderId" in result) {
      const summary = body.summary!;
      const itemList = summary.items
        .map((i) => `  • ${i.quantity}× ${i.name} — R$ ${(i.unitPrice * i.quantity).toFixed(2).replace(".", ",")}`)
        .join("\n");
      const confirmMsg = [
        `✅ Pedido ${result.orderId} confirmado com sucesso!`,
        "",
        "🧾 *Resumo do seu pedido:*",
        itemList,
        `  ─────────────────────────`,
        `  Subtotal: R$ ${summary.subtotal.toFixed(2).replace(".", ",")}`,
        `  Taxa de entrega: R$ ${summary.deliveryFee.toFixed(2).replace(".", ",")}`,
        `  *Total a pagar: R$ ${summary.total.toFixed(2).replace(".", ",")}*`,
        "",
        "💳 Formas de pagamento aceitas na entrega:",
        "  • Dinheiro (informe se precisar de troco)",
        "  • Cartão de débito/crédito",
        "  • Pix",
        "",
        "🛵 Tempo estimado: 35–50 minutos. Acompanhe em *Meus Pedidos*.",
      ].join("\n");

      res.status(200).json({
        message: {
          id: `conf-${Date.now()}`,
          role: "assistant",
          content: confirmMsg,
          createdAt: new Date().toISOString(),
        },
        summary: emptySummary,   // limpa o carrinho após confirmar
        orderId: result.orderId,
      });
      return;
    }

    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível processar o pedido.";
    res.status(422).json({ message });
    next(err);
  }
});

// GET /orders/:id
app.get(
  "/orders/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawId = String(req.params["id"] ?? "").replace(/^#/, "");
      const order = await repo.findById(rawId);
      if (!order) {
        res.status(404).json({ message: "Pedido não encontrado." });
        return;
      }
      res.json(order);
    } catch (err) {
      next(err);
    }
  },
);

// GET /orders
app.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestedLimit = Number(req.query["limit"] ?? 20);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const cursor = req.query["cursor"] as string | undefined;
    const { orders: list, nextCursor } = await repo.list(limit, cursor);

    if (req.query["pagination"] === "true") {
      res.json({ orders: list, nextCursor });
    } else {
      res.json(list);
    }
  } catch (err) {
    next(err);
  }
});

// GET /dashboard
app.get(
  "/dashboard",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { orders: list } = await repo.list(100);
      const today = new Date().toISOString().slice(0, 10);
      const todayOrders = list.filter((o) => o.createdAt.startsWith(today));
      const revenue = todayOrders
        .filter((o) => o.status !== "cancelado")
        .reduce((t, o) => t + o.total, 0);
      const ordersToday = todayOrders.length;
      const cancelled = todayOrders.filter((o) => o.status === "cancelado").length;
      const completed = todayOrders.filter((o) => o.status === "entregue").length;
      const pending = todayOrders.filter((o) =>
        ["recebido", "preparando", "saiu_para_entrega"].includes(o.status),
      ).length;

      const chart = Array.from({ length: 7 }, (_, offset) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - offset));
        const key = date.toISOString().slice(0, 10);
        const dayOrders = list.filter((o) => o.createdAt.startsWith(key));
        return {
          label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((t, o) => t + o.total, 0),
        };
      });

      res.json({
        metrics: {
          ordersToday,
          revenue,
          pending,
          completed,
          cancelled,
          averageTicket: ordersToday
            ? Math.round((revenue / ordersToday) * 100) / 100
            : 0,
        },
        chart,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /health
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Delivery AI backend local está rodando.",
    endpoints: ["POST /orders", "GET /orders", "GET /orders/:id", "GET /dashboard"],
    bedrock: process.env["BEDROCK_MODEL_ID"]
      ? `ativo (${process.env["BEDROCK_MODEL_ID"]})`
      : "fallback por aliases (sem credenciais AWS)",
  });
});

// Error handler global
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[local-server] Erro:", err.message);
  if (!res.headersSent) {
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  🚀  Delivery AI — servidor local iniciado       ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  API:      http://localhost:${PORT}                ║`);
  console.log(`║  CORS:     ${ALLOWED_ORIGIN.padEnd(38, " ")}║`);
  console.log(
    `║  Bedrock:  ${(process.env["BEDROCK_MODEL_ID"] ? "real (credenciais AWS)" : "fallback (aliases)").padEnd(38, " ")}║`,
  );
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");
  console.log("  Endpoints disponíveis:");
  console.log("    POST /orders      — prévia ou confirmação");
  console.log("    GET  /orders      — histórico de pedidos");
  console.log("    GET  /orders/:id  — pedido individual");
  console.log("    GET  /dashboard   — métricas do dia");
  console.log("    GET  /health      — status do servidor");
  console.log("");
  console.log(
    process.env["BEDROCK_MODEL_ID"]
      ? "  ✅ BEDROCK_MODEL_ID configurado — IA real ativa."
      : "  ℹ️  Sem BEDROCK_MODEL_ID — usando parser por aliases do catálogo.",
  );
  console.log("");
});
