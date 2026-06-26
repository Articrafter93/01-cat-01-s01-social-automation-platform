import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listIntegrations, listPrompts } from "@/server/services/settings-service";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePageRole("admin", "/settings");
  const [integrations, prompts] = await Promise.all([listIntegrations(), listPrompts()]);

  return (
    <AppShell currentPath="/settings" eyebrow="Configuration" title="Integrations and templates">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>Overview of the connections available to work on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="rounded-[22px] border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{integration.provider}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{integration.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {integration.status === "healthy" ? "Ready to use." : integration.status === "warning" ? "Needs review." : "Unavailable."}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="rounded-[22px] border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{prompt.channel}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">v{prompt.version}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{prompt.template}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
