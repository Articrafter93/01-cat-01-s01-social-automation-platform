import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authConfig } from "@/auth.config";
import { DEMO_PASSWORD } from "@/lib/demo-accounts";

// Calls the real Credentials authorize function from auth.config.ts.
type Authorize = (credentials: Record<string, string>) => Promise<{ email: string; role: string } | null>;
const authorize = (authConfig.providers[0] as unknown as { options: { authorize: Authorize } }).options.authorize;

// Hermetic: whatever Supabase variables the shell has, these tests run on the local demo store.
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("demo credentials authorize", () => {
  it("signs in a demo account with the demo password, with the account's role", async () => {
    const user = await authorize({ email: "admin@antigravity.local", password: DEMO_PASSWORD });
    expect(user).toMatchObject({ email: "admin@antigravity.local", role: "admin" });
  });

  it("rejects a demo account with any other password of 8 or more characters", async () => {
    expect(await authorize({ email: "admin@antigravity.local", password: "any-other-password" })).toBeNull();
  });

  it("rejects an email that only contains a role name", async () => {
    expect(await authorize({ email: "superadmin@antigravity.local", password: DEMO_PASSWORD })).toBeNull();
    expect(await authorize({ email: "approver@example.com", password: DEMO_PASSWORD })).toBeNull();
  });

  it("is off in a production build unless the exhibition flag opts in", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_AUTH", "");
    vi.stubEnv("DATA_SOURCE_MODE", "");
    expect(await authorize({ email: "admin@antigravity.local", password: DEMO_PASSWORD })).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_DEMO_AUTH", "enabled");
    expect(await authorize({ email: "admin@antigravity.local", password: DEMO_PASSWORD })).toMatchObject({ role: "admin" });
  });

  it("is off in a production build with a Supabase backend, even with the flag: no public password on real data", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_AUTH", "enabled");
    vi.stubEnv("DATA_SOURCE_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
    expect(await authorize({ email: "admin@antigravity.local", password: DEMO_PASSWORD })).toBeNull();
  });
});
