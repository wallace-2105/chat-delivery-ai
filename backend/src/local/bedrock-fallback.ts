/**
 * Parser de linguagem natural baseado em aliases do catálogo.
 * Ativado automaticamente quando BEDROCK_MODEL_ID não está definido.
 * Não requer credenciais AWS nem conexão de rede.
 */

import { catalog } from "../domain/catalog.js";

/** Mapa de numerais por extenso → número */
const wordToNumber: Record<string, number> = {
  um: 1, uma: 1, hum: 1,
  dois: 2, duas: 2,
  três: 3, tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
};

/** Escapa caracteres especiais de regex */
function esc(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Converte "dois" → 2, "3" → 3, undefined → 1 */
function parseQty(raw?: string): number {
  if (!raw) return 1;
  const word = wordToNumber[raw.trim().toLowerCase()];
  if (word !== undefined) return word;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? 1 : Math.min(n, 99);
}

/**
 * Tenta identificar SKUs no texto usando os aliases definidos no catálogo.
 * Extrai quantidades por padrão:
 *   "2 pizzas calabresa", "uma coca", "2x batata", "3 de brownie"
 */
export function parseFallback(
  prompt: string,
): Array<{ sku: string; quantity: number }> {
  // Normalizar: minúsculas, remover acentos opcionais na comparação
  const text = prompt.toLowerCase();
  const results: Array<{ sku: string; quantity: number }> = [];

  // Ordenar produtos pelos aliases mais longos primeiro para evitar match parcial
  const sorted = [...catalog].sort(
    (a, b) =>
      Math.max(...b.aliases.map((al) => al.length)) -
      Math.max(...a.aliases.map((al) => al.length)),
  );

  for (const product of sorted) {
    if (results.some((r) => r.sku === product.sku)) continue;

    const terms = [product.name.toLowerCase(), ...product.aliases.map((a) => a.toLowerCase())];

    for (const term of terms) {
      const e = esc(term);

      // Padrões de quantidade: "2x pizza", "2 pizzas", "duas pizzas", "pizza x2"
      const patterns: RegExp[] = [
        // Número/palavra ANTES: "2 pizza calabresa", "duas cocas"
        new RegExp(
          `(${Object.keys(wordToNumber).join("|")}|\\d+)\\s*[xX×]?\\s*(?:de\\s+|da\\s+|do\\s+)?${e}`,
          "i",
        ),
        // Número DEPOIS: "pizza calabresa x2"
        new RegExp(`${e}\\s*[xX×]\\s*(\\d+)`, "i"),
        // Menção com "e" antes (ex: "e 2 cocas") — já coberta pelo padrão 1
      ];

      let found = false;
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const raw = match[1]; // grupo 1 = quantidade
          const quantity = parseQty(raw);
          results.push({ sku: product.sku, quantity });
          found = true;
          break;
        }
      }

      // Menção simples sem quantidade → assume 1
      if (!found && text.includes(term)) {
        results.push({ sku: product.sku, quantity: 1 });
        found = true;
      }

      if (found) break;
    }
  }

  return results;
}
