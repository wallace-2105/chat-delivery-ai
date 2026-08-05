import { createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { OrderSummaryCard } from "@/components/OrderSummaryCard";
import { OrderProcessingTimeline } from "@/components/OrderProcessingTimeline";
import { useAssistant } from "@/hooks/use-assistant";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente de pedidos | Delivery AI Assistant" },
      {
        name: "description",
        content:
          "Converse com o assistente de IA, monte seu pedido de delivery e acompanhe o resumo em tempo real.",
      },
      { property: "og:title", content: "Assistente de pedidos | Delivery AI Assistant" },
      {
        property: "og:description",
        content: "Monte pedidos de delivery conversando com um assistente inteligente.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { messages, summary, isLoading, isTyping, isConfirming, processing, send, confirm } =
    useAssistant();

  return (
    <div className="flex">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Assistente</h1>
          <p className="text-sm text-muted-foreground">
            Descreva seu pedido em linguagem natural — o assistente monta o carrinho para você.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
              onSend={send}
            />
            <OrderProcessingTimeline
              steps={processing}
              visible={isTyping || processing.some((item) => item.state === "completed")}
            />
          </div>
          <OrderSummaryCard
            summary={summary}
            isLoading={isLoading}
            isConfirming={isConfirming}
            onConfirm={confirm}
          />
        </div>
      </div>
    </div>
  );
}
