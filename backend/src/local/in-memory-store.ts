/**
 * Store em memória que substitui o DynamoDB localmente.
 * Implementa a mesma interface do DynamoOrdersRepository sem precisar de Docker ou AWS.
 */

import type { Order } from "../domain/order.js";

const store: Order[] = [];

export class InMemoryOrdersRepository {
  async save(order: Order): Promise<Order> {
    const idx = store.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      store[idx] = order;
    } else {
      store.unshift(order); // mais recente primeiro
    }
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return store.find((o) => o.id === id || o.id === `DA-${id}`) ?? null;
  }

  async list(
    limit = 20,
    cursor?: string,
  ): Promise<{ orders: Order[]; nextCursor?: string }> {
    const start = cursor ? parseInt(cursor, 10) : 0;
    const slice = store.slice(start, start + limit);
    const nextCursor =
      start + limit < store.length ? String(start + limit) : undefined;
    return { orders: slice, ...(nextCursor ? { nextCursor } : {}) };
  }

  /** Seed inicial de dados para facilitar o desenvolvimento. */
  seed() {
    if (store.length > 0) return; // não sobrescrever se já tem dados
    const now = new Date();
    const day = (offset: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - offset);
      return d.toISOString();
    };

    const seedOrders: Order[] = [
      {
        id: "DA-local-001",
        customer: "João Silva",
        createdAt: day(0),
        status: "entregue",
        items: [
          { id: "pizza-calabresa-g", name: "Pizza de Calabresa (G)", quantity: 1, unitPrice: 54.9 },
          { id: "coca-cola-2l", name: "Coca-Cola 2L", quantity: 2, unitPrice: 12.5 },
        ],
        subtotal: 79.9,
        deliveryFee: 7.9,
        total: 87.8,
      },
      {
        id: "DA-local-002",
        customer: "Maria Santos",
        createdAt: day(0),
        status: "preparando",
        items: [
          { id: "pizza-marguerita-g", name: "Pizza Marguerita (G)", quantity: 1, unitPrice: 49.9 },
          { id: "brownie-sorvete", name: "Brownie com sorvete", quantity: 2, unitPrice: 18.9 },
        ],
        subtotal: 87.7,
        deliveryFee: 7.9,
        total: 95.6,
      },
      {
        id: "DA-local-003",
        customer: "Carlos Mendes",
        createdAt: day(1),
        status: "entregue",
        items: [
          { id: "batata-rustica", name: "Batata rústica", quantity: 1, unitPrice: 22 },
          { id: "coca-cola-2l", name: "Coca-Cola 2L", quantity: 1, unitPrice: 12.5 },
        ],
        subtotal: 34.5,
        deliveryFee: 7.9,
        total: 42.4,
      },
      {
        id: "DA-local-004",
        customer: "Ana Costa",
        createdAt: day(2),
        status: "cancelado",
        items: [
          { id: "pizza-calabresa-g", name: "Pizza de Calabresa (G)", quantity: 2, unitPrice: 54.9 },
        ],
        subtotal: 109.8,
        deliveryFee: 7.9,
        total: 117.7,
      },
    ];

    store.push(...seedOrders);
  }
}
