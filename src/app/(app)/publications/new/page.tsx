import { AppShell } from "@/components/layout/app-shell";
import { NewPublicationForm } from "@/components/publications/new-publication-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageRole } from "@/server/auth/guard";

export default async function NewPublicationPage() {
  await requirePageRole("editor", "/publications/new");
  return (
    <AppShell currentPath="/publications/new" eyebrow="Ingestion" title="New publication">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Create editorial task</CardTitle>
            <CardDescription>
              Load a source, set the tone and choose the channels you want to work on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewPublicationForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before submitting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Check that the source is correct and that the editorial angle is clear.</p>
            <p>LinkedIn, Facebook and Instagram will go through review before being published.</p>
            <p>If a channel is not ready, you can leave it as a draft and pick it up later.</p>
            <p>Sensitive data and internal access are not managed from this view.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
