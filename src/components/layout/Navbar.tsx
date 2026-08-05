import { Link, useRouterState } from "@tanstack/react-router";
import {
  CircleHelp,
  House,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  Network,
  ReceiptText,
  Sun,
} from "lucide-react";

import { RobotIcon } from "@/components/ui/robot-icon";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export const navItems = [
  { title: "Home", url: "/", icon: House },
  { title: "Assistente", url: "/assistente", icon: MessageSquare },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meus Pedidos", url: "/historico", icon: ReceiptText },
  { title: "Arquitetura AWS", url: "/arquitetura", icon: Network },
  { title: "Sobre", url: "/sobre", icon: CircleHelp },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <RobotIcon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight">
              Delivery AI Assistant
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Seu assistente inteligente de delivery
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="mr-2 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === item.url && "bg-accent text-accent-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema"
            onClick={toggleTheme}
            className="transition-transform hover:scale-105"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button asChild className="hidden md:inline-flex">
            <Link to="/assistente">Começar</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-1 text-base">Navegação</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      pathname === item.url && "bg-accent text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
