import { AppShell } from "@/components/layout/app-shell";
import { NewPublicationForm } from "@/components/publications/new-publication-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageRole } from "@/server/auth/guard";

export default async function NewPublicationPage() {
  await requirePageRole("editor", "/publications/new");
  return (
    <AppShell currentPath="/publications/new" eyebrow="Ingesta" title="Nueva publicación">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Crear tarea editorial</CardTitle>
            <CardDescription>
              Carga una fuente, define el tono y elige los canales que quieres trabajar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewPublicationForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Antes de enviar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Verifica que la fuente sea correcta y que el ángulo editorial esté claro.</p>
            <p>LinkedIn, Facebook e Instagram pasarán por revisión antes de publicarse.</p>
            <p>Si un canal no está listo, puedes dejarlo como borrador y retomarlo luego.</p>
            <p>Los datos sensibles y accesos internos no se gestionan desde esta vista.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
