import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedParams = (await searchParams) ?? {};
  const callbackUrl = typeof resolvedParams.callbackUrl === "string" ? resolvedParams.callbackUrl : "/dashboard";
  const error = typeof resolvedParams.error === "string" ? resolvedParams.error : null;

  async function loginAction(formData: FormData) {
    "use server";

    const target = String(formData.get("callbackUrl") ?? "/dashboard");

    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: target,
      });
    } catch (caughtError) {
      if (caughtError instanceof AuthError) {
        redirect(`/login?error=invalid&callbackUrl=${encodeURIComponent(target)}`);
      }

      throw caughtError;
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="rounded-[28px] border border-border/70 bg-card/70 p-6 shadow-panel backdrop-blur-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Acceso interno</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Social Automation Platform</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Centro de control editorial para revisar borradores, aprobaciones, trazabilidad e idempotencia de publicacion
            antes de ejecutar integraciones externas.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Editor</CardTitle>
                <CardDescription>Crea borradores y solicita aprobacion.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">editor@antigravity.local</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approver</CardTitle>
                <CardDescription>Aprueba, rechaza y observa eventos.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">approver@antigravity.local</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin</CardTitle>
                <CardDescription>Administra la configuracion interna.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">admin@antigravity.local</CardContent>
            </Card>
          </div>
        </section>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Acceso</CardTitle>
            <CardDescription>Usa una contrasena de 8 o mas caracteres para acceder al panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <Input name="email" type="email" placeholder="editor@antigravity.local" aria-label="Email" required />
              <Input name="password" type="password" placeholder="minimo 8 caracteres" aria-label="Password" required minLength={8} />
              {error ? <p className="text-sm text-destructive">No fue posible iniciar sesion con esas credenciales.</p> : null}
              <Button type="submit" className="w-full">
                Entrar al panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


