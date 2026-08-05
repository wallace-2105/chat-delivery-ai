export interface ApiEvent {
  body?: string | null;
  pathParameters?: Record<string, string | undefined> | null;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export function response(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": process.env.ALLOWED_ORIGIN ?? "*",
    },
    body: JSON.stringify(body),
  };
}

export function parseBody<T>(body?: string | null): T {
  if (!body) throw new Error("Corpo da requisição é obrigatório.");
  return JSON.parse(body) as T;
}
