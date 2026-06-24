import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Bot, CheckCheck, Clock3, Home, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/publications/new", label: "Nueva publicación", icon: Bot },
  { href: "/approvals", label: "Aprobaciones", icon: CheckCheck },
  { href: "/history", label: "Historial", icon: Clock3 },
  { href: "/observability", label: "Observabilidad", icon: BarChart3 },
  { href: "/settings", label: "Configuración", icon: Settings2 },
];

export function AppShell({
  children,
  currentPath,
  title,
  eyebrow,
}: {
  children: ReactNode;
  currentPath: string;
  title: string;
  eyebrow: string;
}) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-border/70 bg-card/90 p-5 shadow-panel backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Panel editorial</p>
              <h1 className="mt-2 break-words font-display text-2xl font-semibold leading-tight">Social Automation</h1>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">Interno</span>
          </div>

          <div className="mt-8 rounded-[26px] bg-accent/70 p-4">
            <p className="text-sm font-semibold">Centro de trabajo</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Gestiona borradores, aprobaciones y publicaciones desde un solo lugar.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              const className = cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors duration-180",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              );

              if (active) {
                return (
                  <span key={item.href} aria-current="page" className={className}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={className}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[32px] border border-border/70 bg-card/70 p-5 shadow-panel backdrop-blur-sm md:p-8">
          <header className="flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
              Operación editorial
            </div>
          </header>
          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}




