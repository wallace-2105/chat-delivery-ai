import { DynamoOrdersRepository } from "../repositories/orders-repository.js";
import { response, type ApiEvent } from "./http.js";

const orders = new DynamoOrdersRepository();

/**
 * This derives a small dashboard directly from Orders to keep the first version simple.
 * At high volume, a DynamoDB Stream should materialize daily aggregates instead of reading history.
 */
export const handler = async (_event: ApiEvent) => {
  try {
    const { orders: list } = await orders.list(100);
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = list.filter((order) => order.createdAt.startsWith(today));
    const revenue = todayOrders
      .filter((order) => order.status !== "cancelado")
      .reduce((total, order) => total + order.total, 0);
    const ordersToday = todayOrders.length;
    const cancelled = todayOrders.filter((order) => order.status === "cancelado").length;
    const completed = todayOrders.filter((order) => order.status === "entregue").length;
    const pending = todayOrders.filter((order) =>
      ["recebido", "preparando", "saiu_para_entrega"].includes(order.status),
    ).length;
    const chart = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - offset));
      const key = date.toISOString().slice(0, 10);
      const dayOrders = list.filter((order) => order.createdAt.startsWith(key));
      return {
        label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((total, order) => total + order.total, 0),
      };
    });
    return response(200, {
      metrics: {
        ordersToday,
        revenue,
        pending,
        completed,
        cancelled,
        averageTicket: ordersToday ? Math.round((revenue / ordersToday) * 100) / 100 : 0,
      },
      chart,
    });
  } catch (error) {
    console.error("Dashboard query failed", error);
    return response(500, { message: "Não foi possível carregar o dashboard." });
  }
};
