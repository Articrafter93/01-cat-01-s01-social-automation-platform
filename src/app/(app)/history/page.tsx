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
    <AppShell currentPath="/history" eyebrow="Trazabilidad" title="Historial y ejecuciones">
      <Card>
        <CardHeader>
          <CardTitle>Registro operativo completo</CardTitle>
          <CardDescription>Cada tarea conserva estado, costo, latencia, stage final y acceso a detalle.</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicationTable tasks={tasks} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
