import type { OrderItem } from "./order.js";

export interface CatalogProduct extends Omit<OrderItem, "quantity"> {
  sku: string;
  aliases: string[];
}

/** A catalog is kept in code for the demo; in production it should move to its own DynamoDB table. */
export const catalog: CatalogProduct[] = [

  // ── Pizzas Tradicionais ─────────────────────────────────────────────────────────────
  {
    sku: "pizza-calabresa-g",
    id: "pizza-calabresa-g",
    name: "Pizza Calabresa",
    unitPrice: 49.9,
    aliases: ["calabresa", "pizza calabresa", "pizza de calabresa"],
  },
  {
    sku: "pizza-mussarela-g",
    id: "pizza-mussarela-g",
    name: "Pizza Mussarela",
    unitPrice: 47.9,
    aliases: ["mussarela", "muçarela", "pizza mussarela", "pizza de mussarela", "pizza muçarela"],
  },
  {
    sku: "pizza-marguerita-g",
    id: "pizza-marguerita-g",
    name: "Pizza Marguerita",
    unitPrice: 52.9,
    aliases: ["marguerita", "margherita", "pizza marguerita", "pizza de marguerita"],
  },
  {
    sku: "pizza-frango-catupiry-g",
    id: "pizza-frango-catupiry-g",
    name: "Pizza Frango com Catupiry",
    unitPrice: 55.9,
    aliases: ["frango catupiry", "frango com catupiry", "pizza frango catupiry", "pizza de frango"],
  },
  {
    sku: "pizza-portuguesa-g",
    id: "pizza-portuguesa-g",
    name: "Pizza Portuguesa",
    unitPrice: 56.9,
    aliases: ["portuguesa", "pizza portuguesa", "pizza de portuguesa"],
  },
  {
    sku: "pizza-quatro-queijos-g",
    id: "pizza-quatro-queijos-g",
    name: "Pizza Quatro Queijos",
    unitPrice: 58.9,
    aliases: ["quatro queijos", "4 queijos", "pizza quatro queijos", "pizza 4 queijos"],
  },
  {
    sku: "pizza-pepperoni-g",
    id: "pizza-pepperoni-g",
    name: "Pizza Pepperoni",
    unitPrice: 59.9,
    aliases: ["pepperoni", "pizza pepperoni", "pizza de pepperoni"],
  },

  // ── Pizzas Especiais ─────────────────────────────────────────────────────────────
  {
    sku: "pizza-camarao-especial-g",
    id: "pizza-camarao-especial-g",
    name: "Pizza Camarão Especial",
    unitPrice: 79.9,
    aliases: ["camarão especial", "camarao especial", "camarao", "camarão", "pizza de camarão", "pizza camarao"],
  },
  {
    sku: "pizza-costela-barbecue-g",
    id: "pizza-costela-barbecue-g",
    name: "Pizza Costela Barbecue",
    unitPrice: 74.9,
    aliases: ["costela barbecue", "costela", "pizza costela barbecue", "pizza de costela"],
  },
  {
    sku: "pizza-parma-rucula-g",
    id: "pizza-parma-rucula-g",
    name: "Pizza Parma com Rúcula",
    unitPrice: 72.9,
    aliases: ["parma com rúcula", "parma com rucula", "parma", "pizza parma com rúcula", "pizza de parma"],
  },
  {
    sku: "pizza-burrata-premium-g",
    id: "pizza-burrata-premium-g",
    name: "Pizza Burrata Premium",
    unitPrice: 78.9,
    aliases: ["burrata premium", "burrata", "pizza burrata premium", "pizza de burrata"],
  },

  // ── Acompanhamentos ─────────────────────────────────────────────────────────────
  {
    sku: "batata-rustica",
    id: "batata-rustica",
    name: "Batata Rústica",
    unitPrice: 24.9,
    aliases: ["batata rustica", "batata rústica"],
  },
  {
    sku: "batata-frita",
    id: "batata-frita",
    name: "Batata Frita",
    unitPrice: 19.9,
    aliases: ["batata", "batata frita", "fritas", "porção de batata"],
  },
  {
    sku: "onion-rings",
    id: "onion-rings",
    name: "Onion Rings",
    unitPrice: 21.9,
    aliases: ["onion rings", "aneis de cebola", "anéis de cebola"],
  },
  {
    sku: "nuggets-10",
    id: "nuggets-10",
    name: "Nuggets (10 unidades)",
    unitPrice: 26.9,
    aliases: ["nuggets", "nugget", "porção de nuggets"],
  },

  // ── Bebidas ─────────────────────────────────────────────────────────────
  {
    sku: "coca-cola-350ml",
    id: "coca-cola-350ml",
    name: "Coca-Cola 350ml",
    unitPrice: 7.0,
    aliases: ["coca lata", "coca cola lata", "coca 350ml", "coca-cola 350ml"],
  },
  {
    sku: "coca-cola-2l",
    id: "coca-cola-2l",
    name: "Coca-Cola 2L",
    unitPrice: 14.0,
    aliases: ["coca cola", "coca", "coca-cola", "coca 2l"],
  },
  {
    sku: "guarana-2l",
    id: "guarana-2l",
    name: "Guaraná Antarctica 2L",
    unitPrice: 13.0,
    aliases: ["guaraná", "guarana", "guaraná antarctica", "guarana antarctica", "guarana 2l"],
  },
  {
    sku: "fanta-laranja-2l",
    id: "fanta-laranja-2l",
    name: "Fanta Laranja 2L",
    unitPrice: 13.0,
    aliases: ["fanta", "fanta laranja", "fanta 2l"],
  },
  {
    sku: "sprite-2l",
    id: "sprite-2l",
    name: "Sprite 2L",
    unitPrice: 13.0,
    aliases: ["sprite", "sprite 2l"],
  },
  {
    sku: "agua-mineral-500ml",
    id: "agua-mineral-500ml",
    name: "Água Mineral",
    unitPrice: 4.5,
    aliases: ["agua", "água", "agua mineral", "água mineral"],
  },

  // ── Sobremesas ──────────────────────────────────────────────────────────
  {
    sku: "brownie-sorvete",
    id: "brownie-sorvete",
    name: "Brownie com Sorvete",
    unitPrice: 21.9,
    aliases: ["brownie", "brownie com sorvete", "brownie sorvete"],
  },
  {
    sku: "petit-gateau",
    id: "petit-gateau",
    name: "Petit Gateau",
    unitPrice: 24.9,
    aliases: ["petit gateau", "petit gâteau", "petit"],
  },
  {
    sku: "pudim",
    id: "pudim",
    name: "Pudim",
    unitPrice: 14.9,
    aliases: ["pudim", "pudim de leite", "pudim de leite condensado"],
  },
  {
    sku: "mousse-maracuja",
    id: "mousse-maracuja",
    name: "Mousse de Maracujá",
    unitPrice: 12.9,
    aliases: ["mousse", "mousse de maracujá", "mousse de maracuja", "muse"],
  },
];

/** Retorna apenas os sabores de pizza (excluindo meio a meio sintéticos) */
export const pizzaFlavors = catalog.filter(
  (p) => p.sku.startsWith("pizza-"),
);
