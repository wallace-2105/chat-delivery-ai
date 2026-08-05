import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { OrderCard } from "@/components/OrderCard";
import { StatusBadge, statusOptions } from "@/components/StatusBadge";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getHistory } from "@/services/api";
import type { Order } from "@/types";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de pedidos | Delivery AI Assistant" },
      {
        name: "description",
        content:
          "Consulte pedidos simulados com filtros por status e busca por cliente ou número do pedido.",
      },
      { property: "og:title", content: "Histórico de pedidos | Delivery AI Assistant" },
      {
        property: "og:description",
        content: "Filtre e pesquise pedidos de delivery por status, cliente e valor.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");

  useEffect(() => {
    let active = true;
    getHistory()
      .then((data) => active && setOrders(data))
      .catch(() => toast.error("Não foi possível carregar o histórico."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "todos" || order.status === status;
      const matchesTerm =
        !term ||
        order.customer.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [orders, search, status]);

  const resetFilters = () => {
    setSearch("");
    setStatus("todos");
  };

  return (
    <div className="flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
          <p className="text-sm text-muted-foreground">
            Pedidos simulados com status de preparo e entrega.
          </p>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente ou pedido"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Nenhum pedido encontrado"
            description="Ajuste a busca ou o filtro de status para ver outros pedidos."
            actionLabel="Limpar filtros"
            onAction={resetFilters}
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id} className="transition-colors hover:bg-muted/60">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 md:hidden">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
