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
import { InMemoryOrdersRepository } from "./local/in-memory-store.js";
import { parseFallback } from "./local/bedrock-fallback.js";

// ─── Configuração ─────────────────────────────────────────────────────────
const PORT = Number(process.env["PORT"] ?? 3001);
const ALLOWED_ORIGIN = process.env["ALLOWED_ORIGIN"] ?? "http://localhost:8080";

// ─── Repositório em memória (substitui DynamoDB) ──────────────────────────
const repo = new InMemoryOrdersRepository();
repo.seed();

// ─── Helpers de preço e resposta ──────────────────────────────────────────
const money = (v: number) => Math.round(v * 100) / 100;

function buildSummary(
  items: OrderSummary["items"],
  deliveryFee = 7.9,
): OrderSummary {
  const subtotal = money(items.reduce((t, i) => t + i.unitPrice * i.quantity, 0));
  return { items, subtotal, deliveryFee, total: money(subtotal + deliveryFee) };
}

// ─── Workflow local (substitui Step Functions) ────────────────────────────

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

  const items = parsedItems.flatMap((item) => {
    const p = catalog.find((c) => c.sku === item.sku);
    return p
      ? [{ id: p.id, name: p.name, quantity: item.quantity, unitPrice: p.unitPrice }]
      : [];
  });

  if (!items.length && !invalidItems.length) invalidItems.push("nenhum produto reconhecido");

  // ProductExists?
  if (invalidItems.length > 0) {
    throw new Error(
      `Um ou mais produtos não constam no catálogo: ${invalidItems.join(", ")}.`,
    );
  }

  // 3. CalculatePrice
  const summary = buildSummary(items);
  const createdAt = new Date().toISOString();
  const message = {
    id: `m-${Date.now()}`,
    role: "assistant" as const,
    content: `Entendi. Atualizei seu pedido com ${items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}. Deseja confirmar?`,
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
