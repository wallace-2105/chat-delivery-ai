/**
 * Camada conversacional do Delivery AI.
 *
 * Intercepta a mensagem ANTES de enviá-la ao workflow de pedidos e
 * responde a saudações, consultas de cardápio e perguntas gerais.
 * Se a mensagem for um pedido real, retorna null para que o caller
 * processe normalmente.
 */

import { catalog } from "../domain/catalog.js";

// ─── Utilitários ──────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function msgId(): string {
  return `conv-${Date.now()}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

type ConversationResponse = {
  id: string;
  role: "assistant";
  content: string;
  createdAt: string;
} | null;

// ─── Padrões de intenção ──────────────────────────────────────────────────

const GREETING_PATTERNS = [
  /^(oi|olá|ola|hey|hello|e aí|eaí|tudo bem|tudo bom|bom dia|boa tarde|boa noite|boa madrugada|salve|alô|alo)\b/i,
];

const MENU_PATTERNS = [
  /cardápio|cardapio|menu|quais (são |sao )?(os )?sabores|que tem|o que tem|opções|opcoes|sabores de pizza|quais pizzas|qual pizza|tem (pizza|hamburguer|salgado)|lista (de )?produtos?|o que vocês têm|o que voces tem|mostra o cardápio|ver cardapio/i,
];

const HELP_PATTERNS = [
  /como funciona|como (eu )?faço|como (eu )?faco|o que (você|voce) faz|o que (você|voce) sabe|me ajuda|ajuda|quero (um )?pedido|quero pedir|como pedir/i,
];

// ─── Detectar intenção ────────────────────────────────────────────────────

function isGreeting(text: string): boolean {
  return GREETING_PATTERNS.some((p) => p.test(text.trim()));
}

function isMenuRequest(text: string): boolean {
  return MENU_PATTERNS.some((p) => p.test(text));
}

function isHelpRequest(text: string): boolean {
  return HELP_PATTERNS.some((p) => p.test(text));
}

// ─── Montar o cardápio em texto ───────────────────────────────────────────

function buildMenuText(): string {
  const pizzas = catalog.filter((p) => p.sku.startsWith("pizza-") && !p.sku.includes("meio-a-meio"));
  const drinks = catalog.filter((p) =>
    ["coca-cola-2l", "suco-laranja-500ml", "agua-mineral-500ml"].includes(p.sku),
  );
  const sides = catalog.filter((p) =>
    ["batata-rustica", "porcao-nuggets"].includes(p.sku),
  );
  const desserts = catalog.filter((p) =>
    ["brownie-sorvete", "petit-gateau"].includes(p.sku),
  );

  const fmt = (p: (typeof catalog)[0]) =>
    `  • ${p.name} — R$ ${p.unitPrice.toFixed(2).replace(".", ",")}`;

  const lines: string[] = [
    "🍕 *Pizzas* (tamanho grande, serve 2–3 pessoas):",
    ...pizzas.map(fmt),
    "",
    "📍 *Meio a meio disponível!* Peça dois sabores numa pizza.",
    "  Ex.: \"pizza meio a meio calabresa e marguerita\"",
    "",
    "🥤 *Bebidas:*",
    ...drinks.map(fmt),
    "",
    "🍟 *Acompanhamentos:*",
    ...sides.map(fmt),
    "",
    "🍫 *Sobremesas:*",
    ...desserts.map(fmt),
    "",
    "🛵 *Taxa de entrega:* R$ 7,90",
    "",
    "Para pedir, é só me dizer! Ex.: \"quero 2 pizzas de calabresa e 2 cocas\"",
  ];

  return lines.join("\n");
}

// ─── Resposta de saudação ────────────────────────────────────────────────

function greetingResponse(): ConversationResponse {
  const saudacao = getGreeting();
  return {
    id: msgId(),
    role: "assistant",
    content: [
      `${saudacao}! 👋 Bem-vindo à **Pizzaria Delivery AI**!`,
      "",
      "Sou seu assistente virtual e estou aqui para montar seu pedido rapidinho. 🍕",
      "",
      "Você pode:",
      "  • Me dizer o que quer comer diretamente",
      "  • Pedir o **cardápio** para ver os sabores disponíveis",
      "  • Fazer pedidos em linguagem natural — eu entendo tudo!",
      "",
      "O que você vai querer hoje?",
    ].join("\n"),
    createdAt: now(),
  };
}

// ─── Resposta de cardápio ────────────────────────────────────────────────

function menuResponse(): ConversationResponse {
  return {
    id: msgId(),
    role: "assistant",
    content: [
      "Claro! Aqui está nosso cardápio completo 📋",
      "",
      buildMenuText(),
    ].join("\n"),
    createdAt: now(),
  };
}

// ─── Resposta de ajuda ───────────────────────────────────────────────────

function helpResponse(): ConversationResponse {
  return {
    id: msgId(),
    role: "assistant",
    content: [
      "Funciona assim: você me diz o que quer comer em palavras normais e eu monto o resumo do pedido! 😊",
      "",
      "Exemplos do que você pode pedir:",
      "  • \"Quero 2 pizzas de calabresa e 2 cocas\"",
      "  • \"1 pizza meio a meio frango catupiry e calabresa\"",
      "  • \"1 batata rústica e 1 brownie\"",
      "",
      "Depois que eu montar o resumo, você confirma e o pedido é registrado.",
      "",
      "Quer ver o **cardápio** ou já sabe o que quer? 😄",
    ].join("\n"),
    createdAt: now(),
  };
}

// ─── Ponto de entrada principal ───────────────────────────────────────────

/**
 * Retorna uma resposta conversacional se o texto for uma saudação,
 * consulta de cardápio ou pedido de ajuda.
 * Retorna null se for um pedido real (deve ir para o workflow).
 */
export function handleConversation(text: string): ConversationResponse {
  const normalized = text.trim().toLowerCase();

  if (isGreeting(normalized)) return greetingResponse();
  if (isMenuRequest(normalized)) return menuResponse();
  if (isHelpRequest(normalized)) return helpResponse();

  return null;
}
