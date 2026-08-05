import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { StatCard } from "@/components/StatCard";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { getDashboard } from "@/services/api";
import type { DashboardData } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de operação | Delivery AI Assistant" },
      {
        name: "description",
        content:
          "Acompanhe pedidos do dia, receita, pendências e conclusões em um painel com dados fictícios.",
      },
      { property: "og:title", content: "Dashboard de operação | Delivery AI Assistant" },
      {
        property: "og:description",
        content: "Métricas e gráfico semanal de pedidos de delivery.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((result) => active && setData(result))
      .catch(() => toast.error("Não foi possível carregar o dashboard."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da operação com dados fictícios.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pedidos hoje"
            value={String(data?.metrics.ordersToday ?? 0)}
            hint="+12% vs. ontem"
            icon={ShoppingBag}
            loading={isLoading}
          />
          <StatCard
            label="Receita"
            value={formatCurrency(data?.metrics.revenue ?? 0)}
            hint="Ticket médio R$ 73,69"
            icon={DollarSign}
            tone="success"
            loading={isLoading}
          />
          <StatCard
            label="Pedidos pendentes"
            value={String(data?.metrics.pending ?? 0)}
            hint="Em preparo ou rota"
            icon={Clock}
            tone="warning"
            loading={isLoading}
          />
          <StatCard
            label="Pedidos concluídos"
            value={String(data?.metrics.completed ?? 0)}
            hint="Taxa de entrega 98,4%"
            icon={CheckCircle2}
            tone="info"
            loading={isLoading}
          />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Pedidos e receita na semana</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {isLoading || !data ? (
              <Skeleton className="size-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart} margin={{ left: -12, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                    formatter={(value: number, name) =>
                      name === "revenue" ? formatCurrency(value) : value
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
