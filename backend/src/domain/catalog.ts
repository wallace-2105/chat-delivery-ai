import type { OrderItem } from "./order.js";

export interface CatalogProduct extends Omit<OrderItem, "quantity"> {
  sku: string;
  aliases: string[];
}

/** A catalog is kept in code for the demo; in production it should move to its own DynamoDB table. */
export const catalog: CatalogProduct[] = [
  // ── Pizzas ────────────────────────────────────────────────────────────
  {
    sku: "pizza-calabresa-g",
    id: "pizza-calabresa-g",
    name: "Pizza de Calabresa (G)",
    unitPrice: 54.9,
    aliases: [
      "pizza calabresa", "calabresa", "pizza de calabresa",
      "pizza calabresa grande", "pizza grande calabresa",
    ],
  },
  {
    sku: "pizza-marguerita-g",
    id: "pizza-marguerita-g",
    name: "Pizza Marguerita (G)",
    unitPrice: 49.9,
    aliases: [
      "pizza marguerita", "marguerita", "pizza de marguerita",
      "pizza margherita", "margherita", "pizza vegetariana",
    ],
  },
  {
    sku: "pizza-frango-catupiry-g",
    id: "pizza-frango-catupiry-g",
    name: "Pizza Frango com Catupiry (G)",
    unitPrice: 57.9,
    aliases: [
      "pizza frango catupiry", "frango catupiry", "pizza de frango",
      "frango com catupiry", "pizza frango",
    ],
  },
  {
    sku: "pizza-portuguesa-g",
    id: "pizza-portuguesa-g",
    name: "Pizza Portuguesa (G)",
    unitPrice: 56.9,
    aliases: [
      "pizza portuguesa", "portuguesa", "pizza de portuguesa",
    ],
  },

  // ── Bebidas ──────────────────────────────────────────────────────────
  {
    sku: "coca-cola-2l",
    id: "coca-cola-2l",
    name: "Coca-Cola 2L",
    unitPrice: 12.5,
    aliases: [
      "coca cola", "coca", "coca-cola", "refrigerante", "soda",
      "refri", "coca 2l", "coca cola 2l", "pepsi", "guaraná",
    ],
  },
  {
    sku: "suco-laranja-500ml",
    id: "suco-laranja-500ml",
    name: "Suco de Laranja 500ml",
    unitPrice: 9.5,
    aliases: [
      "suco de laranja", "suco laranja", "suco", "laranja",
      "suco natural", "suco de fruta",
    ],
  },
  {
    sku: "agua-mineral-500ml",
    id: "agua-mineral-500ml",
    name: "Água Mineral 500ml",
    unitPrice: 4.5,
    aliases: [
      "agua", "água", "agua mineral", "água mineral",
      "agua gelada", "água sem gás",
    ],
  },

  // ── Acompanhamentos ──────────────────────────────────────────────────
  {
    sku: "batata-rustica",
    id: "batata-rustica",
    name: "Batata Rústica (300g)",
    unitPrice: 22,
    aliases: [
      "batata", "batata rustica", "batata rústica",
      "batata frita", "fritas", "porção de batata",
    ],
  },
  {
    sku: "porcao-nuggets",
    id: "porcao-nuggets",
    name: "Porção de Nuggets (10un)",
    unitPrice: 19.9,
    aliases: [
      "nuggets", "nugget", "porção de nuggets", "porcao nuggets",
    ],
  },

  // ── Sobremesas ───────────────────────────────────────────────────────
  {
    sku: "brownie-sorvete",
    id: "brownie-sorvete",
    name: "Brownie com Sorvete",
    unitPrice: 18.9,
    aliases: [
      "brownie", "brownie com sorvete", "brownie sorvete",
      "sobremesa", "sobremesas",
    ],
  },
  {
    sku: "petit-gateau",
    id: "petit-gateau",
    name: "Petit Gâteau com Sorvete",
    unitPrice: 22.9,
    aliases: [
      "petit gateau", "petit gâteau", "bolinho quente",
      "bolinho de chocolate", "petit",
    ],
  },
];
