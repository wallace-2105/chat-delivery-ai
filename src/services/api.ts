/**
 * Camada de serviço (mock).
 *
 * `VITE_API_BASE_URL` aponta para o stage do API Gateway depois do deploy.
 * Sem essa variável, o modo demonstração mantém dados mockados para que a UI
 * continue navegável sem credenciais AWS.
 *
 * API Gateway foi escolhido como borda HTTP porque entrega autenticação, CORS e
 * escalabilidade gerenciada sem manter um servidor de aplicação.
 */
import type { ChatMessage, DashboardData, Order, OrderSummary, SendOrderResponse } from "@/types";
import {
  initialMessages,
  initialSummary,
  mockDashboard,
  mockOrders,
} from "./mock-data";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"]?.replace(/\/$/, "") ?? "";
const hasApi = Boolean(API_BASE_URL);

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
  if (hasApi) {
    return request<SendOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify({ prompt, currentSummary }),
    });
  }
  await delay(1200);

  // Modo demonstração sem backend: responde sem adicionar itens aleatórios.
  // Para processar pedidos reais, configure VITE_API_BASE_URL=http://localhost:3001
  // e inicie o backend com: cd backend && npm run dev
  const demoReplies = [
    "Olá! Estou em modo demonstração. Para processar pedidos reais, inicie o backend (cd backend && npm run dev) e configure VITE_API_BASE_URL=http://localhost:3001 no arquivo .env.local.",
    "Modo demonstração ativo. Conecte o backend para interpretar pedidos com IA. Enquanto isso, explore a interface normalmente!",
  ];
  return {
    message: {
      id: `m-${Date.now()}`,
      role: "assistant",
      content: demoReplies[Math.floor(Math.random() * demoReplies.length)]!,
      createdAt: new Date().toISOString(),
    },
    summary: currentSummary, // manter o summary atual sem alterações
  };
}

/** POST /orders/confirm — confirma o pedido montado pelo assistente. */
export async function confirmOrder(summary: OrderSummary): Promise<{ orderId: string }> {
  if (hasApi) {
    return request<{ orderId: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({ action: "confirm", summary }),
    });
  }
  await delay(1000);
  if (summary.items.length === 0) {
    throw new Error("Não é possível confirmar um pedido vazio.");
  }
  return { orderId: `#DA-${Math.floor(1000 + Math.random() * 9000)}` };
}

/** GET /orders — histórico de pedidos. */
export async function getHistory(): Promise<Order[]> {
  if (hasApi) return request<Order[]>("/orders");
  await delay(700);
  return mockOrders;
}

/** GET /dashboard — métricas e série temporal. */
export async function getDashboard(): Promise<DashboardData> {
  if (hasApi) return request<DashboardData>("/dashboard");
  await delay(700);
  return mockDashboard;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Não foi possível concluir a solicitação.");
  }
  return response.json() as Promise<T>;
}
