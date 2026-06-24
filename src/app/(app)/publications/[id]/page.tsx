import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalActions } from "@/components/publications/approval-actions";
import { ChannelChip } from "@/components/publications/channel-chip";
import { ExecutionTimeline } from "@/components/publications/execution-timeline";
import { StatusBadge } from "@/components/publications/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicationById } from "@/server/services/publications-service";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageRole("editor", `/publications/${id}`);
  const publication = await getPublicationById(id);

  if (!publication) {
    notFound();
  }

  return (
    <AppShell currentPath="" eyebrow="Detalle" title={publication.title}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Resumen operativo</CardTitle>
                  <CardDescription>Vista general de la tarea y su progreso.</CardDescription>
                </div>
                <StatusBadge status={publication.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fuente</p>
                <p className="mt-2 break-all text-sm font-medium">{publication.sourceUrl}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Última etapa</p>
                <p className="mt-2 text-sm font-medium">{publication.lastRunStage}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Canales</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {publication.requestedChannels.map((channel) => (
                    <ChannelChip key={channel} channel={channel} />
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] border border-border bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Costo estimado</p>
                <p className="mt-2 text-sm font-medium">${publication.metrics.totalEstimatedCostUsd.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drafts por canal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {publication.drafts.map((draft) => (
                <div key={draft.id} className="rounded-[22px] border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <ChannelChip channel={draft.channel} />
                    <span className="text-xs text-muted-foreground">{draft.characterCount} chars · rev {draft.approvedRevision}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{draft.headline}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{draft.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline de ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutionTimeline events={publication.events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
              <CardDescription>Aprueba, solicita cambios o vuelve a intentar la tarea cuando haga falta.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalActions publicationId={publication.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado por canal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {publication.attempts.map((attempt) => (
                <div key={attempt.id} className="rounded-[22px] border border-border bg-background/60 p-4 text-sm">
                  <p className="font-semibold">{attempt.channel}</p>
                  <p className="mt-2 text-muted-foreground">{attempt.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
