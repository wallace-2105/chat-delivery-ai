import { Check, Circle, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProcessingState } from "@/types";

const labels = {
  received: "Recebendo pedido",
  interpreting: "Amazon Bedrock interpretando",
  validating: "Validando produtos",
  pricing: "Calculando preço",
  saving: "Salvando pedido",
  confirmed: "Pedido confirmado",
} as const;

/**
 * Espelha as etapas da State Machine. Hoje a UI as atualiza durante a requisição;
 * quando houver streaming de eventos, basta preencher `steps` com o estado real da execução.
 */
export function OrderProcessingTimeline({
  steps,
  visible,
}: {
  steps: ProcessingState[];
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <section aria-live="polite" className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">Processamento do pedido</p>
      <ol className="space-y-3">
        {steps.map(({ step, state }, index) => (
          <li key={step} className="relative flex items-center gap-3 text-sm">
            {index < steps.length - 1 && (
              <span className="absolute left-[0.6rem] top-6 h-4 border-l border-border" />
            )}
            <StepIcon state={state} />
            <span
              className={cn(
                state === "pending" && "text-muted-foreground",
                state === "error" && "text-destructive",
              )}
            >
              {labels[step]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepIcon({ state }: Pick<ProcessingState, "state">) {
  if (state === "completed")
    return <Check className="size-5 rounded-full bg-success p-1 text-success-foreground" />;
  if (state === "running") return <Loader2 className="size-5 animate-spin text-primary" />;
  if (state === "error")
    return <X className="size-5 rounded-full bg-destructive p-1 text-destructive-foreground" />;
  return <Circle className="size-5 text-muted-foreground" />;
}
