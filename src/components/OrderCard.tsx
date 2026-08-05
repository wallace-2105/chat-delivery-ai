import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="card-hover">
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{order.customer}</p>
            <p className="text-xs text-muted-foreground">
              {order.id} · {formatDateTime(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {order.items.map((item) => (
            <li key={item.id} className="truncate">
              {item.quantity}× {item.name}
            </li>
          ))}
        </ul>
        <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
      </CardContent>
    </Card>
  );
}
