import { RobotIcon } from "@/components/ui/robot-icon";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <RobotIcon className="size-4" />
          </span>
          <span className="truncate font-medium text-foreground">Delivery AI Assistant</span>
        </div>
        <p>Seu assistente inteligente para pedidos de delivery.</p>
        <p className="text-xs">Protótipo de interface · dados mockados</p>
      </div>
    </footer>
  );
}
