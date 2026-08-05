import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const config: Record<OrderStatus, { label: string; className: string }> = {
  recebido: { label: "Recebido", className: "bg-info/12 text-info border-info/25" },
  preparando: { label: "Preparando", className: "bg-warning/15 text-warning border-warning/30" },
  saiu_para_entrega: {
    label: "Saiu para entrega",
    className: "bg-primary/12 text-primary border-primary/30",
  },
  entregue: { label: "Entregue", className: "bg-success/12 text-success border-success/30" },
};

export const statusOptions = (Object.keys(config) as OrderStatus[]).map((value) => ({
  value,
  label: config[value].label,
}));

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
