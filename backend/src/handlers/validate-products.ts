import { catalog } from "../domain/catalog.js";
import type { WorkflowInput } from "../domain/order.js";

export const handler = async (input: WorkflowInput): Promise<WorkflowInput> => {
  const parsed = input.parsedItems ?? [];
  const invalidItems = parsed
    .filter((item) => !catalog.some((product) => product.sku === item.sku))
    .map((item) => item.sku);
  const items = parsed.flatMap((item) => {
    const product = catalog.find((candidate) => candidate.sku === item.sku);
    return product
      ? [
          {
            id: product.id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.unitPrice,
          },
        ]
      : [];
  });
  if (!items.length && !invalidItems.length) invalidItems.push("nenhum produto reconhecido");
  return { ...input, items, invalidItems };
};
