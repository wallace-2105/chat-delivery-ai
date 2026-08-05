import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { confirmOrder, getAssistantSession, sendOrder } from "@/services/api";
import type { ChatMessage, OrderSummary } from "@/types";

const emptySummary: OrderSummary = { items: [], subtotal: 0, deliveryFee: 7.9, total: 0 };

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<OrderSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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
        { id: `u-${Date.now()}`, role: "user", content: trimmed, createdAt: new Date().toISOString() },
      ]);
      setIsTyping(true);

      try {
        const response = await sendOrder(trimmed, summary);
        setMessages((prev) => [...prev, response.message]);
        setSummary(response.summary);
      } catch {
        toast.error("Falha ao falar com o assistente. Tente novamente.");
      } finally {
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

  return { messages, summary, isLoading, isTyping, isConfirming, send, confirm };
}
