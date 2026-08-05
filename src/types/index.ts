export type OrderStatus =
  "recebido" | "preparando" | "saiu_para_entrega" | "entregue" | "cancelado";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface Order {
  id: string;
  customer: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface SendOrderResponse {
  message: ChatMessage;
  summary: OrderSummary;
}

export interface DashboardMetrics {
  ordersToday: number;
  revenue: number;
  pending: number;
  completed: number;
  cancelled: number;
  averageTicket: number;
}

export interface RevenuePoint {
  label: string;
  orders: number;
  revenue: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  chart: RevenuePoint[];
}

export type OrderProcessingStep =
  "received" | "interpreting" | "validating" | "pricing" | "saving" | "confirmed";

export interface ProcessingState {
  step: OrderProcessingStep;
  state: "pending" | "running" | "completed" | "error";
}
