import { Activity, Clock3, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicationTable } from "@/components/publications/publication-table";
import { getDashboardData } from "@/server/services/execution-service";
import { listPublications } from "@/server/services/publications-service";
import { requirePageRole } from "@/server/auth/guard";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requirePageRole("editor", "/dashboard");
  const [dashboard, publications] = await Promise.all([getDashboardData(), listPublications()]);

  return (
    <AppShell currentPath="/dashboard" eyebrow="Control operativo" title="Dashboard editorial">
      <div className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="URLs procesadas" value={String(dashboard.metrics.processed)} hint="Volumen total de tareas rastreadas." />
        <MetricCard label="Pendientes" value={String(dashboard.metrics.pending)} hint="Drafts, jobs en proceso y gates abiertos." />
        <MetricCard label="Aprobadas" value={String(dashboard.metrics.approved)} hint="Listas para publicar o ya orquestadas." />
        <MetricCard label="Publicadas" value={String(dashboard.metrics.published)} hint="Publicaciones completadas sin duplicidad." />
        <MetricCard label="Tasa de fallo" value={formatPercent(dashboard.metrics.failureRate)} hint="Retryable + fatal sobre el total." />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline activo</CardTitle>
            <CardDescription>Fuente de verdad operativa desde la aplicación, no desde Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent>
            <PublicationTable tasks={publications} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Estado general
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm">Tareas listas para revisar</span>
                <span className="text-xs text-muted-foreground">Bandeja al día</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4 text-warning" /> Publicaciones en curso</span>
                <span className="text-xs text-muted-foreground">Seguimiento activo</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm">Canales pendientes</span>
                <span className="text-xs text-muted-foreground">Requieren confirmación</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Activity className="h-5 w-5 text-primary" />
                Eventos recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.recentEvents.map((event) => (
                <div key={event.id} className="rounded-[22px] border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{event.stage}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{event.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{event.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
