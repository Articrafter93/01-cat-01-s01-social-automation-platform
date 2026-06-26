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

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  approver: "Approver",
  editor: "Editor",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePageRole("editor", "/dashboard");
  const [dashboard, publications] = await Promise.all([getDashboardData(), listPublications()]);

  const params = (await searchParams) ?? {};
  const deniedPath = typeof params.denied === "string" ? params.denied : null;
  const neededRole = typeof params.need === "string" ? params.need : null;
  const neededRoleLabel = neededRole ? (roleLabels[neededRole] ?? neededRole) : null;

  return (
    <AppShell currentPath="/dashboard" eyebrow="Operational control" title="Editorial dashboard">
      {deniedPath ? (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-danger/50 bg-danger/12 px-4 py-3 text-sm font-semibold text-danger"
        >
          Access denied: <span className="font-bold underline">{deniedPath}</span> is restricted to the{" "}
          {neededRoleLabel ?? "required"} role. You were redirected to the dashboard.
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="URLs processed" value={String(dashboard.metrics.processed)} hint="Total volume of tracked tasks." />
        <MetricCard label="Pending" value={String(dashboard.metrics.pending)} hint="Drafts, in-progress jobs and open gates." />
        <MetricCard label="Approved" value={String(dashboard.metrics.approved)} hint="Ready to publish or already orchestrated." />
        <MetricCard label="Published" value={String(dashboard.metrics.published)} hint="Completed publications without duplication." />
        <MetricCard label="Failure rate" value={formatPercent(dashboard.metrics.failureRate)} hint="Retryable + fatal over the total." />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Active pipeline</CardTitle>
            <CardDescription>Operational source of truth from the application, not from Google Sheets.</CardDescription>
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
                Overall status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm">Tasks ready to review</span>
                <span className="text-xs text-muted-foreground">Inbox up to date</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4 text-warning" /> Publications in progress</span>
                <span className="text-xs text-muted-foreground">Active tracking</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-background/60 px-4 py-3">
                <span className="flex items-center gap-2 text-sm">Pending channels</span>
                <span className="text-xs text-muted-foreground">Require confirmation</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Activity className="h-5 w-5 text-primary" />
                Recent events
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
