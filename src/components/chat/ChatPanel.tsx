import { Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { RobotIcon } from "@/components/ui/robot-icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  onSend: (content: string) => void;
}

interface ChatForm {
  prompt: string;
}

// ─── Sugestões de pedido organizadas por categoria ────────────────────────
const suggestionGroups = [
  {
    label: "🍕 Pizzas",
    items: [
      "1 pizza de calabresa grande",
      "1 pizza marguerita",
      "2 pizzas de calabresa",
    ],
  },
  {
    label: "🥤 Bebidas",
    items: [
      "2 Coca-Cola 2L",
      "1 suco de laranja",
      "3 refrigerantes",
    ],
  },
  {
    label: "🍟 Acompanhamentos",
    items: [
      "1 batata rústica",
      "2 porções de batata",
    ],
  },
  {
    label: "🍫 Sobremesas",
    items: [
      "1 brownie com sorvete",
      "2 brownies",
    ],
  },
  {
    label: "🛒 Combos",
    items: [
      "1 pizza calabresa, 2 cocas e 1 brownie",
      "1 pizza marguerita e 1 batata rústica",
      "2 pizzas, 2 cocas e 2 brownies",
    ],
  },
];

// Lista plana para os chips rápidos (exibe apenas as mais populares)
const quickSuggestions = [
  "1 pizza de calabresa e 2 cocas",
  "1 pizza marguerita e 1 brownie",
  "2 batatas rústicas e 1 refrigerante",
  "1 brownie com sorvete",
  "1 pizza calabresa, 1 batata e 1 coca",
];

export function ChatPanel({ messages, isLoading, isTyping, onSend }: ChatPanelProps) {
  const { register, handleSubmit, reset, setValue, formState, watch } = useForm<ChatForm>({
    defaultValues: { prompt: "" },
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;
  const currentPrompt = watch("prompt");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping]);

  const submit = handleSubmit(({ prompt }) => {
    if (!prompt.trim()) return;
    onSend(prompt);
    reset({ prompt: "" });
  });

  const handleSuggestionClick = (text: string) => {
    setValue("prompt", text, { shouldDirty: true });
    // Envia direto ao clicar
    onSend(text);
    reset({ prompt: "" });
  };

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100vh-13rem)]">

      {/* ── Área de mensagens ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-20 w-2/3 rounded-2xl" />
          </div>
        ) : isEmpty && !isTyping ? (
          /* ── Tela de boas-vindas (chat vazio) ────────────────────────── */
          <div className="flex h-full flex-col items-center justify-start px-4 pt-8 sm:px-8">
            {/* Avatar do robô */}
            <span className="mb-4 grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <RobotIcon className="size-8" />
            </span>

            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Olá! Eu sou o Delivery AI 👋
            </h2>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Descreva o que você quer comer — eu monto o resumo do pedido para você.
            </p>

            {/* Grupos de sugestões */}
            <div className="mt-6 w-full max-w-lg space-y-4">
              {suggestionGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSuggestionClick(item)}
                        disabled={isTyping}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                      >
                        <Sparkles className="size-3 shrink-0 text-primary" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Mensagens do chat ──────────────────────────────────────── */
          <div className="space-y-5 p-4 sm:p-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Barra de input ───────────────────────────────────────────── */}
      <div className="border-t border-border bg-background/60 p-3 sm:p-4">
        {/* Chips rápidos — mostrados só quando já tem mensagens */}
        {!isEmpty && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isTyping}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="flex items-end gap-2">
          <Textarea
            {...register("prompt")}
            placeholder="Ex.: 1 pizza de calabresa e 2 cocas..."
            rows={2}
            className="min-h-11 resize-none rounded-xl"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar"
            disabled={isTyping || formState.isSubmitting || !currentPrompt?.trim()}
            className="size-11 shrink-0 rounded-xl transition-transform hover:scale-105"
          >
            {isTyping ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
