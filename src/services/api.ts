/**
 * Camada de serviço (mock).
 *
 * Nenhuma chamada HTTP real é feita aqui. Cada função devolve uma Promise com
 * dados mockados e a mesma assinatura que a futura API REST terá
 * (AWS API Gateway + Lambda + Step Functions + Bedrock + DynamoDB).
 *
 * Exemplo de substituição futura:
 *   const res = await fetch(`${API_BASE_URL}/orders`, { method: "POST", body });
 *   return res.json();
 */
import type { ChatMessage, DashboardData, Order, OrderSummary, SendOrderResponse } from "@/types";
import {
  assistantReplies,
  extraItems,
  initialMessages,
  initialSummary,
  mockDashboard,
  mockOrders,
} from "./mock-data";

export const API_BASE_URL = "/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const round = (value: number) => Math.round(value * 100) / 100;

const buildSummary = (items: OrderSummary["items"], deliveryFee = 7.9): OrderSummary => {
  const subtotal = round(items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0));
  return { items, subtotal, deliveryFee, total: round(subtotal + deliveryFee) };
};

/** GET /assistant/session — histórico inicial da conversa. */
export async function getAssistantSession(): Promise<{
  messages: ChatMessage[];
  summary: OrderSummary;
}> {
  await delay(600);
  return { messages: initialMessages, summary: initialSummary };
}

/** POST /orders — envia a mensagem do usuário e recebe a resposta da IA. */
export async function sendOrder(
  prompt: string,
  currentSummary: OrderSummary,
): Promise<SendOrderResponse> {
  await delay(1200);

  const reply = assistantReplies[Math.floor(Math.random() * assistantReplies.length)];
  const nextItem = extraItems.find(
    (item) => !currentSummary.items.some((current) => current.id === item.id),
  );

  const items = nextItem ? [...currentSummary.items, { ...nextItem }] : currentSummary.items;

  return {
    message: {
      id: `m-${Date.now()}`,
      role: "assistant",
      content: `${reply}`,
      createdAt: new Date().toISOString(),
    },
    summary: buildSummary(items, currentSummary.deliveryFee),
  };
}

/** POST /orders/confirm — confirma o pedido montado pelo assistente. */
export async function confirmOrder(summary: OrderSummary): Promise<{ orderId: string }> {
  await delay(1000);
  if (summary.items.length === 0) {
    throw new Error("Não é possível confirmar um pedido vazio.");
  }
  return { orderId: `#DA-${Math.floor(1000 + Math.random() * 9000)}` };
}

/** GET /orders — histórico de pedidos. */
export async function getHistory(): Promise<Order[]> {
  await delay(700);
  return mockOrders;
}

/** GET /dashboard — métricas e série temporal. */
export async function getDashboard(): Promise<DashboardData> {
  await delay(700);
  return mockDashboard;
}
