import { createFileRoute } from "@tanstack/react-router";
import { Code2, Sparkles, Workflow } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre | Delivery AI Assistant" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Projeto de portfólio</p>
          <h1 className="text-2xl font-semibold tracking-tight">Delivery AI Assistant</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Uma demonstração de como transformar a conversa do cliente em um fluxo de pedidos
            confiável usando React, IA generativa e serviços AWS serverless.
          </p>
        </header>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Value
            icon={Sparkles}
            title="Experiência conversacional"
            text="O cliente descreve o pedido em linguagem natural; a IA devolve itens estruturados para revisão."
          />
          <Value
            icon={Workflow}
            title="Processo confiável"
            text="O fluxo do pedido tem etapas explícitas, rastreáveis e com caminhos de erro definidos."
          />
          <Value
            icon={Code2}
            title="Código sustentável"
            text="Tipos, DTOs, serviços e repositórios separam as responsabilidades para facilitar evolução e testes."
          />
        </div>
      </div>
    </div>
  );
}

function Value({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Sparkles;
  title: string;
  text: string;
}) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
