import type { WorkflowInput } from "../domain/order.js";

const money = (value: number) => Math.round(value * 100) / 100;

export const handler = async (input: WorkflowInput): Promise<WorkflowInput> => {
  const items = input.items ?? [];
  const subtotal = money(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
  const deliveryFee = 7.9;
  const summary = { items, subtotal, deliveryFee, total: money(subtotal + deliveryFee) };
  const createdAt = new Date().toISOString();
  return {
    ...input,
    summary,
    message: {
      id: `m-${Date.now()}`,
      role: "assistant",
      content: `Entendi. Atualizei seu pedido com ${items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}. Deseja confirmar?`,
      createdAt,
    },
  };
};
