import { AppShell } from "@/components/layout/app-shell";
import { PublicationTable } from "@/components/publications/publication-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublications } from "@/server/services/publications-service";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await requirePageRole("editor", "/history");
  const tasks = await listPublications();

  return (
    <AppShell currentPath="/history" eyebrow="Traceability" title="History and executions">
      <Card>
        <CardHeader>
          <CardTitle>Complete operational log</CardTitle>
          <CardDescription>Each task keeps its status, cost, latency, final stage and access to detail.</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicationTable tasks={tasks} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
