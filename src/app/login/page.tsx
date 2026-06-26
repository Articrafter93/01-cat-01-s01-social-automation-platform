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
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <section className="rounded-[28px] border border-border/70 bg-card/70 p-6 shadow-panel backdrop-blur-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Internal access</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Social Automation Platform</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Editorial control center to review drafts, approvals, traceability and publication idempotency
            before running external integrations.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Editor</CardTitle>
                <CardDescription>Creates drafts and requests approval.</CardDescription>
              </CardHeader>
              <CardContent className="whitespace-nowrap text-sm text-muted-foreground">editor@antigravity.local</CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Approver</CardTitle>
                <CardDescription>Approves, rejects and watches events.</CardDescription>
              </CardHeader>
              <CardContent className="whitespace-nowrap text-sm text-muted-foreground">approver@antigravity.local</CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Admin</CardTitle>
                <CardDescription>Manages internal configuration.</CardDescription>
              </CardHeader>
              <CardContent className="whitespace-nowrap text-sm text-muted-foreground">admin@antigravity.local</CardContent>
            </Card>
          </div>
        </section>

        <Card className="flex flex-col justify-center">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use a password of 8 or more characters to access the panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <Input
                name="email"
                type="email"
                list="demo-accounts"
                placeholder="editor@antigravity.local"
                aria-label="Email"
                autoComplete="off"
                required
              />
              <datalist id="demo-accounts">
                <option value="editor@antigravity.local">Editor — creates and requests approval</option>
                <option value="approver@antigravity.local">Approver — approves and watches</option>
                <option value="admin@antigravity.local">Admin — internal configuration</option>
              </datalist>
              <Input
                name="password"
                type="password"
                placeholder="minimum 8 characters"
                aria-label="Password"
                defaultValue="demo-access"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Demo: pick an account from the menu and the password is already filled in. Just press Enter.
              </p>
              {error ? <p className="text-sm font-medium text-danger">Could not sign in with those credentials.</p> : null}
              <Button type="submit" className="w-full">
                Enter the panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


