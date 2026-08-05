import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Clock,
  MessagesSquare,
  ShieldCheck,
  Sparkle,
  Truck,
} from "lucide-react";

import { RobotIcon } from "@/components/ui/robot-icon";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delivery AI Assistant — pedidos por conversa" },
      {
        name: "description",
        content:
          "Seu assistente inteligente para pedidos de delivery: converse, monte o carrinho e acompanhe entregas em um painel único.",
      },
      { property: "og:title", content: "Delivery AI Assistant — pedidos por conversa" },
      {
        property: "og:description",
        content:
          "Interface moderna para pedidos de delivery assistidos por IA, com histórico e dashboard operacional.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: MessagesSquare,
    title: "Pedidos por conversa",
    description:
      "Digite o que quer comer em linguagem natural e o assistente monta o carrinho automaticamente.",
  },
  {
    icon: Truck,
    title: "Acompanhamento em tempo real",
    description: "Status de recebido, preparando, saiu para entrega e entregue em um só lugar.",
  },
  {
    icon: BarChart3,
    title: "Dashboard operacional",
    description: "Pedidos do dia, receita, pendências e conclusões com gráficos claros.",
  },
  {
    icon: Clock,
    title: "Respostas instantâneas",
    description: "Sugestões de itens, combos e cupons durante a conversa, sem esperar atendimento.",
  },
  {
    icon: ShieldCheck,
    title: "Pronto para AWS",
    description:
      "Camada de serviço preparada para Step Functions, Bedrock, Lambda e DynamoDB via API REST.",
  },
  {
    icon: Sparkle,
    title: "Experiência refinada",
    description: "Tema claro e escuro, micro animações e layout responsivo em qualquer tela.",
  },
];

function HomePage() {
  return (
    <div>
      <section className="gradient-hero border-b border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <RobotIcon className="size-3.5 text-primary" />
              Assistente de delivery com IA
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Peça comida <span className="text-gradient-primary">conversando</span>, não clicando.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Seu assistente inteligente para pedidos de delivery. Descreva o pedido, revise o
              resumo com subtotal e taxa de entrega e confirme em segundos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="transition-transform hover:scale-[1.03]">
                <Link to="/assistente">
                  Começar
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Protótipo de interface · dados mockados
              </p>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-3">
              {[
                { value: "128", label: "pedidos hoje" },
                { value: "35 min", label: "entrega média" },
                { value: "98,4%", label: "entregas concluídas" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-semibold tracking-tight">{stat.value}</dt>
                  <dd className="text-xs text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tudo que a operação precisa
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Da conversa com o cliente até o acompanhamento das métricas do dia.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="card-hover">
              <CardContent className="space-y-3 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
