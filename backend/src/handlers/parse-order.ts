import type { WorkflowInput } from "../domain/order.js";
import { parseNaturalLanguageOrder } from "../services/bedrock-order-parser.js";

export const handler = async (input: WorkflowInput): Promise<WorkflowInput> => {
  if (input.action === "confirm" && input.summary) {
    return {
      ...input,
      parsedItems: input.summary.items.map(({ id, quantity }) => ({ sku: id, quantity })),
    };
  }
  if (!input.prompt?.trim()) throw new Error("Descreva o pedido para continuar.");
  return { ...input, parsedItems: await parseNaturalLanguageOrder(input.prompt) };
};
