/**
 * Repositório de pedidos usando SQLite via @libsql/client.
 *
 * Funciona em dois modos automaticamente:
 *
 *   Desenvolvimento local:
 *     DATABASE_URL não definida → cria arquivo "orders.db" na pasta backend/
 *
 *   Produção (Render + Turso):
 *     DATABASE_URL=libsql://seu-banco.turso.io
 *     DATABASE_AUTH_TOKEN=eyJ...
 *
 * A interface é idêntica ao InMemoryOrdersRepository —
 * basta trocar a classe no local-server.ts.
 */

import { createClient, type Client } from "@libsql/client";
import type { Order } from "../domain/order.js";

// ─── Conexão ──────────────────────────────────────────────────────────────

function createDb(): Client {
  const url = process.env["DATABASE_URL"];
  const authToken = process.env["DATABASE_AUTH_TOKEN"];

  if (url) {
    // Modo produção: Turso na nuvem
    console.info(`[db] Conectando ao Turso: ${url}`);
    return createClient({ url, authToken });
  }

  // Modo local: arquivo SQLite
  const filePath = new URL("../../orders.db", import.meta.url).pathname;
  // No Windows o pathname começa com /C:/... — libsql aceita file: direto
  const fileUrl = `file:${filePath.replace(/^\/([A-Z]:)/, "$1")}`;
  console.info(`[db] SQLite local: ${fileUrl}`);
  return createClient({ url: fileUrl });
}

// ─── Repositório ──────────────────────────────────────────────────────────

export class LibSQLOrdersRepository {
  private readonly db: Client;
  private ready: Promise<void>;

  constructor() {
    this.db = createDb();
    this.ready = this.migrate();
  }

  /** Cria a tabela se não existir (migration idempotente). */
  private async migrate(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id          TEXT PRIMARY KEY,
        customer    TEXT NOT NULL DEFAULT 'Cliente',
        created_at  TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'recebido',
        items       TEXT NOT NULL DEFAULT '[]',   -- JSON
        subtotal    REAL NOT NULL DEFAULT 0,
        delivery_fee REAL NOT NULL DEFAULT 7.9,
        total       REAL NOT NULL DEFAULT 0
      )
    `);
  }

  // ── Conversão row ↔ Order ──────────────────────────────────────────────

  private toOrder(row: Record<string, unknown>): Order {
    return {
      id: String(row["id"]),
      customer: String(row["customer"]),
      createdAt: String(row["created_at"]),
      status: row["status"] as Order["status"],
      items: JSON.parse(String(row["items"] ?? "[]")) as Order["items"],
      subtotal: Number(row["subtotal"]),
      deliveryFee: Number(row["delivery_fee"]),
      total: Number(row["total"]),
    };
  }

  // ── Operações ──────────────────────────────────────────────────────────

  async save(order: Order): Promise<Order> {
    await this.ready;
    await this.db.execute({
      sql: `
        INSERT INTO orders (id, customer, created_at, status, items, subtotal, delivery_fee, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status       = excluded.status,
          items        = excluded.items,
          subtotal     = excluded.subtotal,
          delivery_fee = excluded.delivery_fee,
          total        = excluded.total
      `,
      args: [
        order.id,
        order.customer,
        order.createdAt,
        order.status,
        JSON.stringify(order.items),
        order.subtotal,
        order.deliveryFee,
        order.total,
      ],
    });
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    await this.ready;
    const result = await this.db.execute({
      sql: "SELECT * FROM orders WHERE id = ? OR id = ?",
      args: [id, `DA-${id}`],
    });
    const row = result.rows[0];
    return row ? this.toOrder(row as Record<string, unknown>) : null;
  }

  async list(
    limit = 20,
    cursor?: string,
  ): Promise<{ orders: Order[]; nextCursor?: string }> {
    await this.ready;

    const offset = cursor ? parseInt(cursor, 10) : 0;
    const result = await this.db.execute({
      sql: "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [limit + 1, offset], // busca 1 a mais para saber se tem próxima página
    });

    const rows = result.rows as Record<string, unknown>[];
    const hasMore = rows.length > limit;
    const orders = rows.slice(0, limit).map((r) => this.toOrder(r));
    const nextCursor = hasMore ? String(offset + limit) : undefined;

    return { orders, ...(nextCursor ? { nextCursor } : {}) };
  }

  /** Seed de dados iniciais — só insere se o banco estiver vazio. */
  async seed(): Promise<void> {
    await this.ready;
    const count = await this.db.execute("SELECT COUNT(*) as n FROM orders");
    const n = Number((count.rows[0] as Record<string, unknown>)["n"] ?? 0);
    if (n > 0) return;

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
          { id: "pizza-calabresa-g", name: "Pizza Calabresa (G)", quantity: 1, unitPrice: 54.9 },
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
          { id: "brownie-sorvete", name: "Brownie com Sorvete", quantity: 2, unitPrice: 18.9 },
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
          { id: "batata-rustica", name: "Batata Rústica (300g)", quantity: 1, unitPrice: 22 },
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
          { id: "pizza-calabresa-g", name: "Pizza Calabresa (G)", quantity: 2, unitPrice: 54.9 },
        ],
        subtotal: 109.8,
        deliveryFee: 7.9,
        total: 117.7,
      },
    ];

    for (const order of seedOrders) {
      await this.save(order);
    }
    console.info(`[db] Seed: ${seedOrders.length} pedidos inseridos.`);
  }
}
