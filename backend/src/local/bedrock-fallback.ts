/**
 * Parser de linguagem natural baseado em aliases do catálogo.
 * Ativado automaticamente quando BEDROCK_MODEL_ID não está definido.
 * Não requer credenciais AWS nem conexão de rede.
 */

import { catalog } from "../domain/catalog.js";

/**
 * Tenta identificar SKUs no texto usando os aliases definidos no catálogo.
 * Extrai quantidades por padrão "N x produto", "N pizzas", etc.
 */
export function parseFallback(
  prompt: string,
): Array<{ sku: string; quantity: number }> {
  const text = prompt.toLowerCase();
  const results: Array<{ sku: string; quantity: number }> = [];

  for (const product of catalog) {
    // Todos os termos que identificam esse produto
    const terms = [product.name.toLowerCase(), ...product.aliases.map((a) => a.toLowerCase())];

    for (const term of terms) {
      // Padrões: "2 pizzas calabresa", "uma coca", "2x batata", "3 de brownie"
      const patterns = [
        new RegExp(`(\\d+)\\s*[xX×]?\\s*(?:de\\s+)?${escapeRegex(term)}`, "i"),
        new RegExp(`${escapeRegex(term)}\\s*[xX×]\\s*(\\d+)`, "i"),
        // Numerais por extenso simples
        new RegExp(`(um|uma|dois|duas|três|quatro|cinco)\\s+(?:de\\s+)?${escapeRegex(term)}`, "i"),
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const rawQty = match[1];
          const quantity = parseWordNumber(rawQty) ?? parseInt(rawQty, 10) ?? 1;
          // Evitar duplicatas para o mesmo SKU
          if (!results.some((r) => r.sku === product.sku)) {
            results.push({ sku: product.sku, quantity: Math.max(1, quantity) });
          }
          break;
        }
      }

      // Menção simples sem quantidade (assume 1)
      if (
        !results.some((r) => r.sku === product.sku) &&
        text.includes(term)
      ) {
        results.push({ sku: product.sku, quantity: 1 });
        break;
      }
    }
  }

  return results;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseWordNumber(word: string): number | null {
  const map: Record<string, number> = {
    um: 1, uma: 1,
    dois: 2, duas: 2,
    três: 3, tres: 3,
    quatro: 4,
    cinco: 5,
  };
  return map[word?.toLowerCase()] ?? null;
}
