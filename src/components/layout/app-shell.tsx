import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Bot, CheckCheck, Clock3, Home, LogOut, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { auth, signOut } from "@/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/publications/new", label: "New publication", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: CheckCheck },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/observability", label: "Observability", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  editor: "Editor",
  approver: "Approver",
};

export async function AppShell({
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
  const session = await auth();
  const userEmail = session?.user?.email ?? "Active session";
  const roleLabel = roleLabels[session?.user?.role ?? "editor"] ?? "Editor";

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-[32px] border border-border/70 bg-card/90 p-5 shadow-panel backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Editorial panel</p>
              <h1 className="mt-2 break-words font-display text-2xl font-semibold leading-tight">Social Automation</h1>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">Internal</span>
          </div>

          <div className="mt-8 rounded-[26px] bg-accent/70 p-4">
            <p className="text-sm font-semibold">Workspace</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Manage drafts, approvals and publications from a single place.
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

          <div className="mt-auto pt-8">
            <div className="rounded-[22px] border border-border/70 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Session</p>
              <p className="mt-2 break-words text-sm font-medium leading-snug">{userEmail}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              {/*
                Logout via a Node-runtime server action: signOut() clears the
                Auth.js session cookie and redirects to /login, where the demo
                account selector + prefilled password let a recruiter re-enter
                as a different role with minimal friction.
              */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
                className="mt-4"
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors duration-180 hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="rounded-[32px] border border-border/70 bg-card/70 p-5 shadow-panel backdrop-blur-sm md:p-8">
          <header className="flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
              Editorial operation
            </div>
          </header>
          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}




