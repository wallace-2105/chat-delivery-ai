import { Loader2, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
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

const suggestions = [
  "Quero uma pizza de calabresa e uma Coca-Cola.",
  "Tem opção vegetariana?",
  "Qual o tempo de entrega?",
];

export function ChatPanel({ messages, isLoading, isTyping, onSend }: ChatPanelProps) {
  const { register, handleSubmit, reset, setValue, formState } = useForm<ChatForm>({
    defaultValues: { prompt: "" },
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping]);

  const submit = handleSubmit(({ prompt }) => {
    if (!prompt.trim()) return;
    onSend(prompt);
    reset({ prompt: "" });
  });

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100vh-13rem)]">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-20 w-2/3 rounded-2xl" />
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-background/60 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue("prompt", suggestion, { shouldDirty: true })}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-end gap-2">
          <Textarea
            {...register("prompt")}
            placeholder="Ex.: Quero uma pizza de calabresa e uma Coca-Cola."
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
            disabled={isTyping || formState.isSubmitting}
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
