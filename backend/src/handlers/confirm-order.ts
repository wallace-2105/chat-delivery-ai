import type { WorkflowInput } from "../domain/order.js";

/** Confirmation is intentionally a distinct Lambda so it can later notify kitchen/payment services without changing the workflow contract. */
export const handler = async (input: WorkflowInput): Promise<{ orderId: string }> => {
  if (!input.order) throw new Error("Pedido não foi persistido.");
  return { orderId: `#${input.order.id}` };
};
