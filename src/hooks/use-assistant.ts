import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { confirmOrder, getAssistantSession, sendOrder } from "@/services/api";
import type { ChatMessage, OrderProcessingStep, OrderSummary, ProcessingState } from "@/types";

const emptySummary: OrderSummary = { items: [], subtotal: 0, deliveryFee: 7.9, total: 0 };
const workflowSteps: OrderProcessingStep[] = [
  "received",
  "interpreting",
  "validating",
  "pricing",
  "saving",
  "confirmed",
];
const initialProcessing = (): ProcessingState[] =>
  workflowSteps.map((step) => ({ step, state: "pending" }));

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<OrderSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState[]>(initialProcessing);

  useEffect(() => {
    let active = true;
    getAssistantSession()
      .then((session) => {
        if (!active) return;
        setMessages(session.messages);
        setSummary(session.summary);
      })
      .catch(() => toast.error("Não foi possível carregar a conversa."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isTyping) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ]);
      setIsTyping(true);
      setProcessing((previous) =>
        previous.map((item, index) => ({ ...item, state: index === 0 ? "running" : "pending" })),
      );
      let currentStep = 0;
      const progressTimer = window.setInterval(() => {
        currentStep += 1;
        setProcessing((previous) =>
          previous.map((item, index) => ({
            ...item,
            state:
              index < currentStep ? "completed" : index === currentStep ? "running" : "pending",
          })),
        );
      }, 320);

      try {
        const response = await sendOrder(trimmed, summary);
        setMessages((prev) => [...prev, response.message]);
        setSummary(response.summary);
        setProcessing((previous) => previous.map((item) => ({ ...item, state: "completed" })));
      } catch {
        setProcessing((previous) =>
          previous.map((item, index) => ({
            ...item,
            state: index === currentStep ? "error" : item.state,
          })),
        );
        toast.error("Falha ao falar com o assistente. Tente novamente.");
      } finally {
        window.clearInterval(progressTimer);
        setIsTyping(false);
      }
    },
    [isTyping, summary],
  );

  const confirm = useCallback(async () => {
    setIsConfirming(true);
    try {
      const { orderId } = await confirmOrder(summary);
      toast.success(`Pedido ${orderId} confirmado!`, {
        description: "Você pode acompanhar o status na página de histórico.",
      });
      return orderId;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível confirmar o pedido.");
      return null;
    } finally {
      setIsConfirming(false);
    }
  }, [summary]);

  return { messages, summary, isLoading, isTyping, isConfirming, processing, send, confirm };
}
