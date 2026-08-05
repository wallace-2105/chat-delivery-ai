import { Bot, User } from "lucide-react";

import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex animate-in items-start gap-3 fade-in slide-in-from-bottom-2 duration-300",
        isUser && "flex-row-reverse",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg border border-border",
          isUser ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex animate-in items-center gap-3 fade-in duration-300">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-primary text-primary-foreground">
        <Bot className="size-4" />
      </span>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
        <span className="flex gap-1">
          <span className="typing-dot size-1.5 rounded-full bg-current" />
          <span
            className="typing-dot size-1.5 rounded-full bg-current"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="typing-dot size-1.5 rounded-full bg-current"
            style={{ animationDelay: "0.3s" }}
          />
        </span>
        Digitando...
      </div>
    </div>
  );
}
