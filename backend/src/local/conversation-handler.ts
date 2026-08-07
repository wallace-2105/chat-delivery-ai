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
  // Separar categorias conforme especificado
  const pizzasTradicionais = catalog.filter((p) => 
    p.sku.startsWith("pizza-") && !["camarao-especial", "costela-barbecue", "parma-rucula", "burrata-premium"].some(sku => p.sku.includes(sku)) && !p.sku.includes("meio-")
  );
  
  const pizzasEspeciais = catalog.filter((p) => 
    ["camarao-especial", "costela-barbecue", "parma-rucula", "burrata-premium"].some(sku => p.sku.includes(sku))
  );

  const sides = catalog.filter((p) =>
    ["batata", "onion", "nuggets"].some(sku => p.sku.includes(sku))
  );

  const drinks = catalog.filter((p) =>
    ["coca", "guarana", "fanta", "sprite", "agua"].some(sku => p.sku.includes(sku))
  );

  const desserts = catalog.filter((p) =>
    ["brownie", "petit", "pudim", "mousse"].some(sku => p.sku.includes(sku))
  );

  const fmt = (p: (typeof catalog)[0]) =>
    `• ${p.name} — R$ ${p.unitPrice.toFixed(2).replace(".", ",")}`;

  const lines: string[] = [
    "🍕 **Pizzas Tradicionais**",
    ...pizzasTradicionais.map(fmt),
    "",
    "🍕 **Pizzas Especiais**",
    ...pizzasEspeciais.map(fmt),
    "",
    "🥔 **Acompanhamentos**",
    ...sides.map(fmt),
    "",
    "🥤 **Bebidas**",
    ...drinks.map(fmt),
    "",
    "🍰 **Sobremesas**",
    ...desserts.map(fmt),
    "",
    "Me diga o que você deseja para montarmos o seu pedido! 😊",
  ];

  return lines.join("\n");
}

// ─── Resposta de saudação ────────────────────────────────────────────────

function greetingResponse(text: string): ConversationResponse {
  const normalized = text.toLowerCase();
  
  let saudacao = "Olá";
  let content = "Olá! Seja bem-vindo ao Delivery AI. Me diga o que você procura e eu preparo seu pedido.";
  
  if (normalized.includes("bom dia")) {
    content = "Bom dia! 😊 Seja muito bem-vindo ao Delivery AI. Como posso ajudar hoje? Posso mostrar nosso cardápio ou montar seu pedido.";
  } else if (normalized.includes("boa tarde")) {
    content = "Boa tarde! 😊 Seja muito bem-vindo ao Delivery AI. Como posso ajudar hoje? Posso mostrar nosso cardápio ou montar seu pedido.";
  } else if (normalized.includes("boa noite")) {
    content = "Boa noite! 🍕 Que bom ter você por aqui. Está com vontade de pizza, bebidas ou acompanhamentos?";
  }
  
  return {
    id: msgId(),
    role: "assistant",
    content,
    createdAt: now(),
  };
}

// ─── Resposta de cardápio ────────────────────────────────────────────────

function menuResponse(): ConversationResponse {
  return {
    id: msgId(),
    role: "assistant",
    content: buildMenuText(),
    createdAt: now(),
  };
}

// ─── Resposta de ajuda ───────────────────────────────────────────────────

function helpResponse(): ConversationResponse {
  return {
    id: msgId(),
    role: "assistant",
    content: [
      "Eu sou o Delivery AI, seu atendente virtual! 😊",
      "",
      "Você pode pedir do seu jeito. Por exemplo:",
      "• \"Quero 2 pizzas de calabresa e uma coca de 2 litros\"",
      "• \"Me vê 1 batata rústica e 1 pudim\"",
      "• \"Uma pizza meio a meio quatro queijos e peperoni\"",
      "",
      "Quer ver o **cardápio** para escolher ou já sabe o que vai pedir?",
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

  // Ordem de prioridade
  if (isMenuRequest(normalized)) return menuResponse();
  if (isHelpRequest(normalized)) return helpResponse();
  if (isGreeting(normalized)) return greetingResponse(text);

  return null;
}
