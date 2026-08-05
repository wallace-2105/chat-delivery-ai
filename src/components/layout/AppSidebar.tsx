import { Link, useRouterState } from "@tanstack/react-router";

import { navItems } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/70 bg-sidebar p-4 lg:block">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Operação
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
              pathname === item.url &&
                "bg-primary/10 text-foreground shadow-[inset_2px_0_0_0_var(--primary)]",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-6 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        Interface mockada, pronta para integração com AWS Step Functions, Bedrock, Lambda e
        DynamoDB.
      </div>
    </aside>
  );
}
