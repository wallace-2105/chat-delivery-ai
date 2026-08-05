import { Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { OrderSummary } from "@/types";

interface OrderSummaryCardProps {
  summary: OrderSummary;
  isLoading: boolean;
  isConfirming: boolean;
  onConfirm: () => Promise<string | null>;
}

export function OrderSummaryCard({
  summary,
  isLoading,
  isConfirming,
  onConfirm,
}: OrderSummaryCardProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    const orderId = await onConfirm();
    if (orderId) setOpen(false);
  };

  return (
    <>
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4 text-primary" />
            Resumo do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : summary.items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Nenhum item ainda"
              description="Converse com o assistente para montar seu pedido."
            />
          ) : (
            <>
              <ul className="space-y-3">
                {summary.items.map((item) => (
                  <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity}× {formatCurrency(item.unitPrice)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={formatCurrency(summary.subtotal)} />
                <Row label="Taxa de entrega" value={formatCurrency(summary.deliveryFee)} />
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(summary.total)}</span>
                </div>
              </div>

              <Button
                className="w-full transition-transform hover:scale-[1.02]"
                onClick={() => setOpen(true)}
              >
                Confirmar Pedido
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pedido</DialogTitle>
            <DialogDescription>
              Total de {formatCurrency(summary.total)} com entrega estimada em 35–45 minutos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Voltar
            </Button>
            <Button onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
