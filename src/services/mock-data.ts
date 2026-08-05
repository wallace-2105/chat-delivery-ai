import type { ChatMessage, DashboardData, Order, OrderSummary } from "@/types";

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Olá! Sou o Delivery AI Assistant. Diga o que você quer comer e eu monto o pedido para você.",
    createdAt: "2026-08-05T13:40:00.000Z",
  },
  {
    id: "m2",
    role: "user",
    content: "Quero uma pizza de calabresa e uma Coca-Cola.",
    createdAt: "2026-08-05T13:40:30.000Z",
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "Perfeito! Adicionei 1 Pizza de Calabresa (grande) e 1 Coca-Cola 2L ao seu pedido. Quer incluir uma sobremesa?",
    createdAt: "2026-08-05T13:40:38.000Z",
  },
];

export const initialSummary: OrderSummary = {
  items: [
    { id: "i1", name: "Pizza de Calabresa (G)", quantity: 1, unitPrice: 54.9 },
    { id: "i2", name: "Coca-Cola 2L", quantity: 1, unitPrice: 12.5 },
  ],
  subtotal: 67.4,
  deliveryFee: 7.9,
  total: 75.3,
};

export const assistantReplies: string[] = [
  "Anotado! Atualizei o resumo do seu pedido. Deseja adicionar mais alguma coisa?",
  "Ótima escolha. O tempo estimado de entrega é de 35 a 45 minutos.",
  "Incluí o item no carrinho. Posso aplicar o cupom PRIMEIRA10 de 10% de desconto?",
  "Pedido atualizado. Quando quiser, toque em Confirmar Pedido para finalizar.",
];

export const extraItems = [
  { id: "i3", name: "Brownie com sorvete", quantity: 1, unitPrice: 18.9 },
  { id: "i4", name: "Batata rústica", quantity: 1, unitPrice: 22.0 },
  { id: "i5", name: "Suco de laranja 500ml", quantity: 2, unitPrice: 9.5 },
];

export const mockOrders: Order[] = [
  {
    id: "#DA-1042",
    customer: "Marina Alves",
    createdAt: "2026-08-05T13:12:00.000Z",
    status: "recebido",
    items: [{ id: "a1", name: "Pizza Marguerita", quantity: 1, unitPrice: 49.9 }],
    total: 57.8,
  },
  {
    id: "#DA-1041",
    customer: "Rafael Costa",
    createdAt: "2026-08-05T12:48:00.000Z",
    status: "preparando",
    items: [{ id: "a2", name: "Combo Burger Duplo", quantity: 2, unitPrice: 38.5 }],
    total: 84.9,
  },
  {
    id: "#DA-1040",
    customer: "Juliana Prado",
    createdAt: "2026-08-05T12:20:00.000Z",
    status: "saiu_para_entrega",
    items: [{ id: "a3", name: "Sushi 20 peças", quantity: 1, unitPrice: 89.0 }],
    total: 96.9,
  },
  {
    id: "#DA-1039",
    customer: "Carlos Menezes",
    createdAt: "2026-08-05T11:55:00.000Z",
    status: "entregue",
    items: [{ id: "a4", name: "Pizza de Calabresa (G)", quantity: 1, unitPrice: 54.9 }],
    total: 62.8,
  },
  {
    id: "#DA-1038",
    customer: "Bianca Rocha",
    createdAt: "2026-08-04T21:32:00.000Z",
    status: "entregue",
    items: [{ id: "a5", name: "Açaí 700ml", quantity: 2, unitPrice: 26.0 }],
    total: 59.9,
  },
  {
    id: "#DA-1037",
    customer: "Diego Martins",
    createdAt: "2026-08-04T20:10:00.000Z",
    status: "entregue",
    items: [{ id: "a6", name: "Yakisoba de frango", quantity: 1, unitPrice: 42.0 }],
    total: 49.9,
  },
  {
    id: "#DA-1036",
    customer: "Helena Souza",
    createdAt: "2026-08-04T19:44:00.000Z",
    status: "preparando",
    items: [{ id: "a7", name: "Esfiha mista (10)", quantity: 1, unitPrice: 35.0 }],
    total: 42.9,
  },
  {
    id: "#DA-1035",
    customer: "Pedro Lima",
    createdAt: "2026-08-04T18:05:00.000Z",
    status: "saiu_para_entrega",
    items: [{ id: "a8", name: "Poke bowl salmão", quantity: 1, unitPrice: 52.0 }],
    total: 59.9,
  },
];

export const mockDashboard: DashboardData = {
  metrics: {
    ordersToday: 128,
    revenue: 9432.75,
    pending: 14,
    completed: 106,
    cancelled: 8,
    averageTicket: 73.69,
  },
  chart: [
    { label: "Seg", orders: 82, revenue: 5120 },
    { label: "Ter", orders: 96, revenue: 6240 },
    { label: "Qua", orders: 74, revenue: 4810 },
    { label: "Qui", orders: 112, revenue: 7680 },
    { label: "Sex", orders: 148, revenue: 10240 },
    { label: "Sáb", orders: 176, revenue: 12890 },
    { label: "Dom", orders: 128, revenue: 9432 },
  ],
};
