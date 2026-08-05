import { randomUUID } from "node:crypto";

import type { Order, WorkflowInput } from "../domain/order.js";
import { DynamoOrdersRepository } from "../repositories/orders-repository.js";

const orders = new DynamoOrdersRepository();

export const handler = async (input: WorkflowInput): Promise<WorkflowInput> => {
  if (!input.summary) throw new Error("Resumo do pedido ausente.");
  const order: Order = {
    id: `DA-${randomUUID()}`,
    customer: input.customer ?? "Cliente",
    createdAt: new Date().toISOString(),
    status: "recebido",
    ...input.summary,
  };
  await orders.save(order);
  return { ...input, order };
};
