import { createFileRoute } from "@tanstack/react-router";
import { Bot, Braces, Database, Gauge, ShieldCheck, Workflow } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/arquitetura")({
  head: () => ({ meta: [{ title: "Arquitetura AWS | Delivery AI Assistant" }] }),
  component: ArchitecturePage,
});

const services = [
  {
    icon: Braces,
    name: "API Gateway",
    description: "Expõe uma API REST protegida e sem servidores para o front-end.",
    reason:
      "É a borda gerenciada da aplicação: escala sob demanda e elimina a operação de um servidor HTTP.",
  },
  {
    icon: Workflow,
    name: "AWS Step Functions",
    description: "Coordena interpretação, validação, precificação, persistência e confirmação.",
    reason:
      "Torna o fluxo auditável e resiliente, com estados, retries e tratamento explícito de falhas.",
  },
  {
    icon: Bot,
    name: "Amazon Bedrock",
    description: "Converte linguagem natural em itens estruturados e seguros para processamento.",
    reason: "Oferece IA generativa pela AWS sem administrar infraestrutura ou hospedar um modelo.",
  },
  {
    icon: Database,
    name: "Amazon DynamoDB",
    description: "Armazena pedidos e permite consultar o histórico por data e status.",
    reason: "É uma base serverless de baixa latência, ideal para o volume variável de pedidos.",
  },
  {
    icon: Gauge,
    name: "Amazon CloudWatch",
    description: "Centraliza logs, métricas e alarmes das Lambdas e da State Machine.",
    reason: "A observabilidade nativa reduz o tempo de diagnóstico sem adicionar outra plataforma.",
  },
  {
    icon: ShieldCheck,
    name: "IAM",
    description: "Concede permissões mínimas por função e por recurso.",
    reason:
      "O princípio do menor privilégio limita o impacto de credenciais ou código comprometido.",
  },
];

function ArchitecturePage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-primary">Serverless por design</p>
          <h1 className="text-2xl font-semibold tracking-tight">Arquitetura AWS</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Cada pedido percorre um fluxo gerenciado, observável e preparado para escalar sem
            servidores persistentes.
          </p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Fluxo do pedido</CardTitle>
            <CardDescription>
              Da conversa à confirmação, com o Step Functions como orquestrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
              {[
                "Cliente",
                "React",
                "API Gateway",
                "Lambda",
                "Step Functions",
                "Amazon Bedrock",
                "Lambda",
                "DynamoDB",
                "Resposta",
              ].map((item, index, items) => (
                <span key={`${item}-${index}`} className="flex items-center gap-2">
                  <span className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                    {item}
                  </span>
                  {index < items.length - 1 && <span className="text-primary">→</span>}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(({ icon: Icon, name, description, reason }) => (
            <Card key={name} className="card-hover">
              <CardHeader className="pb-3">
                <span className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Por que foi escolhido: </span>
                {reason}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
