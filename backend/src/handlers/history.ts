import { DynamoOrdersRepository } from "../repositories/orders-repository.js";
import { response, type ApiEvent } from "./http.js";

const orders = new DynamoOrdersRepository();

export const handler = async (event: ApiEvent) => {
  try {
    const id = event.pathParameters?.id;
    if (id) {
      const order = await orders.findById(id.replace(/^#/, ""));
      return order ? response(200, order) : response(404, { message: "Pedido não encontrado." });
    }
    const requestedLimit = Number(event.queryStringParameters?.limit ?? 20);
    const { orders: list, nextCursor } = await orders.list(
      Math.min(Math.max(requestedLimit, 1), 100),
      event.queryStringParameters?.cursor,
    );
    // The web UI currently expects an array; clients can opt into cursor metadata with pagination=true.
    return event.queryStringParameters?.pagination === "true"
      ? response(200, { orders: list, nextCursor })
      : response(200, list);
  } catch (error) {
    console.error("History query failed", error);
    return response(500, { message: "Não foi possível consultar os pedidos." });
  }
};
