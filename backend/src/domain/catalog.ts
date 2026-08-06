import type { OrderItem } from "./order.js";

export interface CatalogProduct extends Omit<OrderItem, "quantity"> {
  sku: string;
  aliases: string[];
}

/** A catalog is kept in code for the demo; in production it should move to its own DynamoDB table. */
export const catalog: CatalogProduct[] = [

  // ── Pizzas ─────────────────────────────────────────────────────────────
  {
    sku: "pizza-calabresa-g",
    id: "pizza-calabresa-g",
    name: "Pizza Calabresa (G)",
    unitPrice: 54.9,
    aliases: [
      "calabresa", "pizza calabresa", "pizza de calabresa",
      "pizza calabresa grande", "calabresa grande",
    ],
  },
  {
    sku: "pizza-marguerita-g",
    id: "pizza-marguerita-g",
    name: "Pizza Marguerita (G)",
    unitPrice: 49.9,
    aliases: [
      "marguerita", "margherita", "pizza marguerita", "pizza de marguerita",
      "pizza margherita", "pizza vegetariana",
    ],
  },
  {
    sku: "pizza-frango-catupiry-g",
    id: "pizza-frango-catupiry-g",
    name: "Pizza Frango c/ Catupiry (G)",
    unitPrice: 57.9,
    aliases: [
      "frango catupiry", "frango com catupiry", "pizza frango catupiry",
      "pizza de frango", "pizza frango", "frango",
    ],
  },
  {
    sku: "pizza-portuguesa-g",
    id: "pizza-portuguesa-g",
    name: "Pizza Portuguesa (G)",
    unitPrice: 56.9,
    aliases: [
      "portuguesa", "pizza portuguesa", "pizza de portuguesa",
    ],
  },
  {
    sku: "pizza-quatro-queijos-g",
    id: "pizza-quatro-queijos-g",
    name: "Pizza Quatro Queijos (G)",
    unitPrice: 59.9,
    aliases: [
      "quatro queijos", "4 queijos", "pizza quatro queijos",
      "pizza 4 queijos", "queijos", "pizza de queijo",
    ],
  },
  {
    sku: "pizza-pepperoni-g",
    id: "pizza-pepperoni-g",
    name: "Pizza Pepperoni (G)",
    unitPrice: 58.9,
    aliases: [
      "pepperoni", "pizza pepperoni", "pizza de pepperoni",
    ],
  },
  {
    sku: "pizza-napolitana-g",
    id: "pizza-napolitana-g",
    name: "Pizza Napolitana (G)",
    unitPrice: 52.9,
    aliases: [
      "napolitana", "pizza napolitana", "pizza de napolitana",
    ],
  },
  {
    sku: "pizza-bacon-g",
    id: "pizza-bacon-g",
    name: "Pizza Bacon (G)",
    unitPrice: 55.9,
    aliases: [
      "bacon", "pizza bacon", "pizza de bacon",
    ],
  },
  {
    sku: "pizza-palmito-g",
    id: "pizza-palmito-g",
    name: "Pizza Palmito (G)",
    unitPrice: 53.9,
    aliases: [
      "palmito", "pizza palmito", "pizza de palmito",
    ],
  },
  {
    sku: "pizza-atum-g",
    id: "pizza-atum-g",
    name: "Pizza Atum (G)",
    unitPrice: 54.9,
    aliases: [
      "atum", "pizza atum", "pizza de atum",
    ],
  },
  {
    sku: "pizza-mussarela-g",
    id: "pizza-mussarela-g",
    name: "Pizza Mussarela (G)",
    unitPrice: 48.9,
    aliases: [
      "mussarela", "muçarela", "muzarela", "pizza mussarela",
      "pizza de mussarela", "pizza muçarela",
    ],
  },
  {
    sku: "pizza-carne-seca-g",
    id: "pizza-carne-seca-g",
    name: "Pizza Carne Seca c/ Cebola (G)",
    unitPrice: 60.9,
    aliases: [
      "carne seca", "carne seca com cebola", "pizza carne seca",
      "pizza de carne seca",
    ],
  },

  // ── Bebidas ─────────────────────────────────────────────────────────────
  {
    sku: "coca-cola-2l",
    id: "coca-cola-2l",
    name: "Coca-Cola 2L",
    unitPrice: 12.5,
    aliases: [
      "coca cola", "coca", "coca-cola", "refrigerante", "soda",
      "refri", "coca 2l", "pepsi", "guaraná", "guarana",
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

  // ── Acompanhamentos ─────────────────────────────────────────────────────
  {
    sku: "batata-rustica",
    id: "batata-rustica",
    name: "Batata Rústica (300g)",
    unitPrice: 22,
    aliases: [
      "batata", "batata rustica", "batata rústica",
      "batata frita", "fritas", "porção de batata", "porcao de batata",
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

  // ── Sobremesas ──────────────────────────────────────────────────────────
  {
    sku: "brownie-sorvete",
    id: "brownie-sorvete",
    name: "Brownie com Sorvete",
    unitPrice: 18.9,
    aliases: [
      "brownie", "brownie com sorvete", "brownie sorvete",
      "sobremesa brownie",
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

/** Retorna apenas os sabores de pizza (excluindo meio a meio sintéticos) */
export const pizzaFlavors = catalog.filter(
  (p) => p.sku.startsWith("pizza-"),
);
