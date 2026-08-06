import { ChevronDown, ChevronUp, Loader2, Pizza, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

// ─── Mini cardápio do robô ─────────────────────────────────────────────────

const MENU = {
  pizzas: [
    { name: "Calabresa", price: "R$ 54,90" },
    { name: "Marguerita", price: "R$ 49,90" },
    { name: "Mussarela", price: "R$ 48,90" },
    { name: "Frango c/ Catupiry", price: "R$ 57,90" },
    { name: "Portuguesa", price: "R$ 56,90" },
    { name: "Quatro Queijos", price: "R$ 59,90" },
    { name: "Pepperoni", price: "R$ 58,90" },
    { name: "Napolitana", price: "R$ 52,90" },
    { name: "Bacon", price: "R$ 55,90" },
    { name: "Palmito", price: "R$ 53,90" },
    { name: "Atum", price: "R$ 54,90" },
    { name: "Carne Seca c/ Cebola", price: "R$ 60,90" },
  ],
  drinks: [
    { name: "Coca-Cola 2L", price: "R$ 12,50" },
    { name: "Suco de Laranja 500ml", price: "R$ 9,50" },
    { name: "Água Mineral 500ml", price: "R$ 4,50" },
  ],
  sides: [
    { name: "Batata Rústica 300g", price: "R$ 22,00" },
    { name: "Porção de Nuggets (10un)", price: "R$ 19,90" },
  ],
  desserts: [
    { name: "Brownie com Sorvete", price: "R$ 18,90" },
    { name: "Petit Gâteau com Sorvete", price: "R$ 22,90" },
  ],
};

// ─── Chips de sugestão (preenchem o campo, não enviam direto) ─────────────

const QUICK_SUGGESTIONS = [
  "Bom dia! O que vocês têm?",
  "Cardápio por favor",
  "1 pizza de calabresa e 2 cocas",
  "Pizza meio a meio calabresa e marguerita",
  "1 pizza frango catupiry e 1 batata rústica",
  "2 pizzas quatro queijos e 2 cocas",
];

// ─── Componente mini cardápio ─────────────────────────────────────────────

function MiniMenu({ onSelect }: { onSelect: (text: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 w-full max-w-lg rounded-2xl border border-border bg-background overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Pizza className="size-4 text-primary" />
          Ver cardápio completo
        </span>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4">
          {/* Pizzas */}
          <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🍕 Pizzas (G) — Serve 2–3 pessoas
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {MENU.pizzas.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelect(`1 pizza de ${item.name.toLowerCase()}`)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground font-medium">{item.price}</span>
              </button>
            ))}
          </div>

          <p className="mt-1 mb-1 px-3 text-xs text-muted-foreground italic">
            📍 Aceitamos meio a meio! Ex.: "pizza meio a meio calabresa e marguerita"
          </p>

          {/* Bebidas */}
          <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🥤 Bebidas
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {MENU.drinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelect(`1 ${item.name.toLowerCase()}`)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground font-medium">{item.price}</span>
              </button>
            ))}
          </div>

          {/* Acompanhamentos */}
          <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🍟 Acompanhamentos
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {MENU.sides.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelect(`1 ${item.name.toLowerCase()}`)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground font-medium">{item.price}</span>
              </button>
            ))}
          </div>

          {/* Sobremesas */}
          <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🍫 Sobremesas
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {MENU.desserts.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelect(`1 ${item.name.toLowerCase()}`)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors text-left"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground font-medium">{item.price}</span>
              </button>
            ))}
          </div>

          <p className="mt-3 px-1 text-xs text-muted-foreground">
            🛵 Taxa de entrega: <strong>R$ 7,90</strong> · Tempo: 35–50 min
          </p>
        </div>
      )}
    </div>
  );
}

// ─── ChatPanel principal ──────────────────────────────────────────────────

export function ChatPanel({ messages, isLoading, isTyping, onSend }: ChatPanelProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<ChatForm>({
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

  // Preenche o campo de texto (não envia automaticamente)
  const fillPrompt = (text: string) => {
    setValue("prompt", text, { shouldDirty: true });
    // Focar o campo para o usuário poder editar ou confirmar com Enter
    document.getElementById("chat-input")?.focus();
  };

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100vh-13rem)]">

      {/* ── Área de mensagens ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-20 w-2/3 rounded-2xl" />
          </div>
        ) : isEmpty && !isTyping ? (
          /* ── Tela de boas-vindas ─────────────────────────────────────── */
          <div className="flex h-full flex-col items-center overflow-y-auto px-4 pt-8 pb-4 sm:px-8">
            {/* Avatar */}
            <span className="mb-4 grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <RobotIcon className="size-8" />
            </span>

            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Olá! Eu sou o Delivery AI 👋
            </h2>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Me diga o que quer comer, peça o cardápio ou comece com um oi!
            </p>

            {/* Chips de sugestão */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => fillPrompt(s)}
                  disabled={isTyping}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Mini cardápio */}
            <MiniMenu onSelect={fillPrompt} />
          </div>
        ) : (
          /* ── Mensagens da conversa ───────────────────────────────────── */
          <div className="space-y-5 p-4 sm:p-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Barra de input ───────────────────────────────────────────────── */}
      <div className="border-t border-border bg-background/60 p-3 sm:p-4">
        {/* Chips rápidos — só aparecem quando já existe conversa */}
        {!isEmpty && (
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              "Cardápio",
              "1 pizza de calabresa",
              "Pizza meio a meio",
              "2 cocas",
              "1 batata rústica",
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => fillPrompt(s)}
                disabled={isTyping}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="flex items-end gap-2">
          <Textarea
            id="chat-input"
            {...register("prompt")}
            placeholder="Diga oi, peça o cardápio ou faça seu pedido..."
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
            disabled={isTyping || !currentPrompt?.trim()}
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
