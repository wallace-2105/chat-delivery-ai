/**
 * Emulação local do AWS Step Functions Express Workflow.
 * Executa os handlers em sequência diretamente em memória,
 * respeitando a mesma lógica de decisão do ASL (order-workflow.asl.json).
 *
 * Fluxo:
 *   InterpretOrder → ValidateProducts → ProductExists? →
 *   CalculatePrice → IsConfirmation? → (SaveOrder → ConfirmOrder | ReturnPreview)
 */

import type { WorkflowInput } from "../domain/order.js";
import { parseFallback } from "./bedrock-fallback.js";

// ─── Importar handlers individualmente ──────────────────────────────────────
import { handler as parseOrderHandler } from "../handlers/parse-order.js";
import { handler as validateProductsHandler } from "../handlers/validate-products.js";
import { handler as calculatePriceHandler } from "../handlers/calculate-price.js";
import { handler as saveOrderHandler } from "../handlers/save-order.js";
import { handler as confirmOrderHandler } from "../handlers/confirm-order.js";

/** Resultado do workflow de preview */
export interface PreviewResult {
  message: { id: string; role: "assistant"; content: string; createdAt: string };
  summary: WorkflowInput["summary"];
}

/** Resultado do workflow de confirmação */
export interface ConfirmResult {
  orderId: string;
}

export type WorkflowResult = PreviewResult | ConfirmResult;

/**
 * Executa o workflow completo de pedido localmente.
 * Intercepta a chamada ao Bedrock quando não há credenciais AWS,
 * usando o parser por aliases do catálogo como fallback.
 */
export async function runOrderWorkflow(input: WorkflowInput): Promise<WorkflowResult> {
  // ── Etapa 1: InterpretOrder (ParseOrder Lambda) ───────────────────────────
  let state: WorkflowInput;
  try {
    state = await parseOrderHandler(input);
  } catch (err) {
    // Bedrock não disponível localmente → usar fallback por aliases
    const fallbackItems = parseFallback(input.prompt ?? "");
    if (fallbackItems.length === 0) {
      throw new Error(
        "Não consegui identificar produtos no seu pedido. " +
          "Tente mencionar: pizza calabresa, marguerita, coca cola, brownie ou batata rústica.",
      );
    }
    state = { ...input, parsedItems: fallbackItems };
    console.info(
      "[local] Bedrock indisponível — usando parser de fallback por aliases:",
      fallbackItems,
    );
  }

  // ── Etapa 2: ValidateProducts ─────────────────────────────────────────────
  state = await validateProductsHandler(state);

  // ── Etapa 3: ProductExists? (Choice State) ────────────────────────────────
  if (state.invalidItems && state.invalidItems.length > 0) {
    throw new Error(
      `Um ou mais produtos não constam no catálogo: ${state.invalidItems.join(", ")}.`,
    );
  }

  // ── Etapa 4: CalculatePrice ───────────────────────────────────────────────
  state = await calculatePriceHandler(state);

  // ── Etapa 5: IsConfirmation? (Choice State) ───────────────────────────────
  if (state.action !== "confirm") {
    // ReturnPreview — apenas a prévia, sem persistência
    return {
      message: state.message!,
      summary: state.summary,
    } as PreviewResult;
  }

  // ── Etapa 6: SaveOrder ────────────────────────────────────────────────────
  state = await saveOrderHandler(state);

  // ── Etapa 7: ConfirmOrder ─────────────────────────────────────────────────
  return confirmOrderHandler(state) as Promise<ConfirmResult>;
}
