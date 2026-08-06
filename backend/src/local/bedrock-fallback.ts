/**
 * Parser de linguagem natural baseado em aliases do catálogo.
 * Ativado automaticamente quando BEDROCK_MODEL_ID não está definido.
 * Suporta:
 *  - Quantidades numéricas e por extenso (um, dois, três...)
 *  - Pizza meio a meio com dois sabores
 *  - Múltiplos itens em uma mesma frase
 */

import { catalog } from "../domain/catalog.js";

// ─── Mapa de números por extenso ─────────────────────────────────────────

const WORD_TO_NUM: Record<string, number> = {
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
const WORD_PATTERN = Object.keys(WORD_TO_NUM).join("|");

function esc(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseQty(raw?: string): number {
  if (!raw) return 1;
  const word = WORD_TO_NUM[raw.trim().toLowerCase()];
  if (word !== undefined) return word;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? 1 : Math.min(n, 99);
}

// ─── Meio a meio ──────────────────────────────────────────────────────────

/**
 * Detecta "pizza meio a meio [sabor1] e [sabor2]" e retorna um item sintético
 * combinando os dois sabores com preço médio.
 */
function detectMeioAMeio(
  text: string,
): Array<{ sku: string; quantity: number }> | null {
  // Padrão: "meio a meio [sabor1] e [sabor2]" ou "meio a meio [sabor1] com [sabor2]"
  const meioMatch = text.match(
    /(?:pizza\s+)?meio\s+a?\s*meio\s+(.+?)\s+(?:e|com)\s+(.+?)(?:\s*,|$)/i,
  );
  if (!meioMatch) return null;

  const flavor1Text = meioMatch[1]?.trim().toLowerCase() ?? "";
  const flavor2Text = meioMatch[2]?.trim().toLowerCase() ?? "";

  // Procurar cada sabor no catálogo
  const pizzas = catalog.filter((p) => p.sku.startsWith("pizza-"));

  const findPizza = (searchText: string) =>
    pizzas.find((p) =>
      [p.name.toLowerCase(), ...p.aliases.map((a) => a.toLowerCase())].some(
        (alias) => searchText.includes(alias) || alias.includes(searchText),
      ),
    );

  const p1 = findPizza(flavor1Text);
  const p2 = findPizza(flavor2Text);

  if (!p1 || !p2) return null;

  // Criar item sintético "meio a meio"
  const avgPrice = Math.round(((p1.unitPrice + p2.unitPrice) / 2) * 100) / 100;
  const syntheticSku = `pizza-meio-${p1.sku.replace("pizza-", "")}-e-${p2.sku.replace("pizza-", "")}`;

  // Adicionar ao catálogo temporariamente de forma dinâmica
  // (o validate-products vai rejeitar SKUs desconhecidos, então injetamos o produto)
  if (!catalog.find((c) => c.sku === syntheticSku)) {
    catalog.push({
      sku: syntheticSku,
      id: syntheticSku,
      name: `Pizza Meio a Meio: ${p1.name.replace(" (G)", "")} + ${p2.name.replace(" (G)", "")} (G)`,
      unitPrice: avgPrice,
      aliases: [],
    });
  }

  return [{ sku: syntheticSku, quantity: 1 }];
}

// ─── Parser principal ─────────────────────────────────────────────────────

/**
 * Tenta identificar SKUs no texto usando aliases do catálogo.
 * Retorna lista de { sku, quantity } reconhecidos.
 */
export function parseFallback(
  prompt: string,
): Array<{ sku: string; quantity: number }> {
  const text = prompt.toLowerCase();
  const results: Array<{ sku: string; quantity: number }> = [];

  // 1. Tentar meio a meio primeiro
  const meioAMeio = detectMeioAMeio(text);
  if (meioAMeio) {
    results.push(...meioAMeio);
  }

  // 2. Remover a parte "meio a meio" do texto para não re-parsear os sabores individualmente
  const textWithoutMeio = text.replace(/(?:pizza\s+)?meio\s+a?\s*meio\s+.+?(?:\s*,|$)/gi, " ");

  // 3. Ordenar produtos pelos aliases mais longos primeiro (evita match parcial)
  const sorted = [...catalog].sort(
    (a, b) =>
      Math.max(0, ...b.aliases.map((al) => al.length)) -
      Math.max(0, ...a.aliases.map((al) => al.length)),
  );

  for (const product of sorted) {
    // Não re-processar SKU já adicionado (ex: meio a meio)
    if (results.some((r) => r.sku === product.sku)) continue;
    // Pular os produtos sintéticos de meio a meio já adicionados ao catálogo
    if (product.sku.includes("pizza-meio-")) continue;

    const terms = [
      product.name.toLowerCase(),
      ...product.aliases.map((a) => a.toLowerCase()),
    ];

    let found = false;
    for (const term of terms) {
      const e = esc(term);

      // Padrões de quantidade: "2 cocas", "duas pizzas", "pizza x2"
      const patterns: RegExp[] = [
        // Número/palavra ANTES do item
        new RegExp(
          `(${WORD_PATTERN}|\\d+)\\s*[xX×]?\\s*(?:de\\s+|da\\s+|do\\s+|dos\\s+)?${e}`,
          "i",
        ),
        // Número DEPOIS do item
        new RegExp(`${e}\\s*[xX×]\\s*(\\d+)`, "i"),
      ];

      let matched = false;
      for (const pattern of patterns) {
        const match = textWithoutMeio.match(pattern);
        if (match) {
          const raw = match[1];
          results.push({ sku: product.sku, quantity: parseQty(raw) });
          matched = true;
          found = true;
          break;
        }
      }

      // Menção simples sem quantidade → assume 1
      if (!matched && textWithoutMeio.includes(term)) {
        results.push({ sku: product.sku, quantity: 1 });
        found = true;
      }

      if (found) break;
    }
  }

  return results;
}
