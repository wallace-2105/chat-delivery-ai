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

export interface Order extends OrderSummary {
  id: string;
  customer: string;
  createdAt: string;
  status: OrderStatus;
}

export interface WorkflowInput {
  action: "preview" | "confirm";
  prompt?: string;
  currentSummary?: OrderSummary;
  summary?: OrderSummary;
  customer?: string;
  parsedItems?: Array<{ sku: string; quantity: number }>;
  items?: OrderItem[];
  invalidItems?: string[];
  message?: { id: string; role: "assistant"; content: string; createdAt: string };
  order?: Order;
}
