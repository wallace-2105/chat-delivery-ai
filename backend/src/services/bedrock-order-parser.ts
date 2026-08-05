import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

import { catalog } from "../domain/catalog.js";

const client = new BedrockRuntimeClient({});
const modelId = process.env.BEDROCK_MODEL_ID;

/**
 * Bedrock is used here instead of regexes because customer messages are open-ended.
 * The application still validates every SKU locally: the model proposes items, never prices.
 */
export async function parseNaturalLanguageOrder(
  prompt: string,
): Promise<Array<{ sku: string; quantity: number }>> {
  if (!modelId) throw new Error("BEDROCK_MODEL_ID não configurado.");

  const productList = catalog.map(({ sku, name }) => ({ sku, name }));
  const request = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 400,
    temperature: 0,
    system: "Você extrai itens de delivery. Responda exclusivamente JSON válido, sem markdown.",
    messages: [
      {
        role: "user",
        content: `Catálogo permitido: ${JSON.stringify(productList)}. Mensagem: ${JSON.stringify(prompt)}. Retorne {"items":[{"sku":"sku do catálogo","quantity":n}],"unknown":[]}. Quantidade deve ser inteiro positivo.`,
      },
    ],
  };

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(JSON.stringify(request)),
    }),
  );
  const payload = JSON.parse(new TextDecoder().decode(response.body)) as {
    content?: Array<{ text?: string }>;
  };
  const text = payload.content?.[0]?.text;
  if (!text) throw new Error("Amazon Bedrock retornou uma resposta vazia.");
  const parsed = JSON.parse(text) as { items?: Array<{ sku?: unknown; quantity?: unknown }> };
  return (parsed.items ?? [])
    .filter(
      (item): item is { sku: string; quantity: number } =>
        typeof item.sku === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
    .slice(0, 20);
}
