import type { OrderItem } from "./order.js";

export interface CatalogProduct extends Omit<OrderItem, "quantity"> {
  sku: string;
  aliases: string[];
}

/** A catalog is kept in code for the demo; in production it should move to its own DynamoDB table. */
export const catalog: CatalogProduct[] = [
  {
    sku: "pizza-calabresa-g",
    id: "pizza-calabresa-g",
    name: "Pizza de Calabresa (G)",
    unitPrice: 54.9,
    aliases: ["pizza calabresa", "calabresa"],
  },
  {
    sku: "pizza-marguerita-g",
    id: "pizza-marguerita-g",
    name: "Pizza Marguerita (G)",
    unitPrice: 49.9,
    aliases: ["pizza marguerita", "marguerita"],
  },
  {
    sku: "coca-cola-2l",
    id: "coca-cola-2l",
    name: "Coca-Cola 2L",
    unitPrice: 12.5,
    aliases: ["coca cola", "coca", "refrigerante"],
  },
  {
    sku: "brownie-sorvete",
    id: "brownie-sorvete",
    name: "Brownie com sorvete",
    unitPrice: 18.9,
    aliases: ["brownie"],
  },
  {
    sku: "batata-rustica",
    id: "batata-rustica",
    name: "Batata rústica",
    unitPrice: 22,
    aliases: ["batata"],
  },
];
