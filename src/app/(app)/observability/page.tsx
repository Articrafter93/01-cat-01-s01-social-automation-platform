import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listExecutions } from "@/server/services/execution-service";
import { requirePageRole } from "@/server/auth/guard";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ObservabilityPage() {
  await requirePageRole("approver", "/observability");
  const events = await listExecutions();
  const llmCost = events.reduce((sum, event) => sum + event.estimatedCostUsd, 0);
  const avgLatency = Math.round(events.reduce((sum, event) => sum + event.latencyMs, 0) / Math.max(events.length, 1));

  return (
    <AppShell currentPath="/observability" eyebrow="Observabilidad" title="Costos, latencias y reintentos">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-2xl">Costo aproximado</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{formatCurrency(llmCost)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-2xl">Latencia media</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{avgLatency} ms</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-2xl">Eventos trazados</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{events.length}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumen por etapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border bg-background/60 p-4 text-sm">
              <div>
                <p className="font-medium">{event.stage}</p>
                <p className="text-muted-foreground">{event.message}</p>
              </div>
              <div className="text-right text-muted-foreground">
                <p>{event.latencyMs} ms</p>
                <p>{formatCurrency(event.estimatedCostUsd)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
