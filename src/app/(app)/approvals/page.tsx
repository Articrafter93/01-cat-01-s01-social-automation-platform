import { AppShell } from "@/components/layout/app-shell";
import { ApprovalActions } from "@/components/publications/approval-actions";
import { ChannelChip } from "@/components/publications/channel-chip";
import { StatusBadge } from "@/components/publications/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublications } from "@/server/services/publications-service";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requirePageRole("approver", "/approvals");
  const tasks = (await listPublications()).filter((task) => ["needs_approval", "draft"].includes(task.status));

  return (
    <AppShell currentPath="/approvals" eyebrow="Editorial gate" title="Bandeja de aprobación">
      <div className="space-y-6">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>{task.sourceUrl}</CardDescription>
                </div>
                <StatusBadge status={task.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_340px]">
              <div className="space-y-4">
                {(task.drafts ?? []).map((draft) => (
                  <div key={draft.id} className="rounded-[24px] border border-border bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <ChannelChip channel={draft.channel} />
                      <span className="text-xs text-muted-foreground">{draft.characterCount} chars</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">{draft.headline}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{draft.body}</p>
                    {draft.validationWarnings.length > 0 ? (
                      <p className="mt-3 text-xs text-warning-foreground">{draft.validationWarnings.join(" ")}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-border bg-background/60 p-4">
                <p className="text-sm font-semibold">Acciones</p>
                <p className="mt-1 text-sm text-muted-foreground">Aprueba, devuelve a ajustes o reintenta la tarea desde aquí.</p>
                <div className="mt-4">
                  <ApprovalActions publicationId={task.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
