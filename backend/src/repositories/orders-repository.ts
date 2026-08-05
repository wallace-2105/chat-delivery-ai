import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import type { Order } from "../domain/order.js";

const tableName = process.env.ORDERS_TABLE_NAME!;
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/** DynamoDB is chosen for its serverless, low-latency persistence; the GSI avoids scanning the table for history. */
export class DynamoOrdersRepository {
  async save(order: Order): Promise<Order> {
    await db.send(
      new PutCommand({
        TableName: tableName,
        Item: { ...order, gsi1pk: "ORDER", gsi1sk: order.createdAt },
      }),
    );
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const result = await db.send(new GetCommand({ TableName: tableName, Key: { id } }));
    return (result.Item as Order | undefined) ?? null;
  }

  async list(limit = 20, cursor?: string): Promise<{ orders: Order[]; nextCursor?: string }> {
    const result = await db.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "byCreatedAt",
        KeyConditionExpression: "gsi1pk = :partition",
        ExpressionAttributeValues: { ":partition": "ORDER" },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: cursor
          ? JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"))
          : undefined,
      }),
    );
    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64url")
      : undefined;
    return { orders: (result.Items ?? []) as Order[], ...(nextCursor ? { nextCursor } : {}) };
  }
}
