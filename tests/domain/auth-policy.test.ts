import { describe, expect, it } from "vitest";
import { DEMO_PASSWORD } from "@/lib/demo-accounts";
import { getRequiredRole, resolveDemoAccount } from "@/server/auth/policy";

describe("resolveDemoAccount", () => {
  it("signs in each demo account with the demo password and takes the role from the account", () => {
    expect(resolveDemoAccount("editor@antigravity.local", DEMO_PASSWORD)?.role).toBe("editor");
    expect(resolveDemoAccount("approver@antigravity.local", DEMO_PASSWORD)?.role).toBe("approver");
    expect(resolveDemoAccount(" Admin@Antigravity.Local ", DEMO_PASSWORD)?.role).toBe("admin");
  });

  it("rejects a demo account with any other password", () => {
    expect(resolveDemoAccount("admin@antigravity.local", "any-other-password")).toBeNull();
    expect(resolveDemoAccount("admin@antigravity.local", "")).toBeNull();
  });

  it("rejects emails that are not demo accounts, even if they contain a role name", () => {
    for (const email of ["superadmin@antigravity.local", "admin2@antigravity.local", "admin@example.com", "someone@example.com"]) {
      expect(resolveDemoAccount(email, DEMO_PASSWORD), email).toBeNull();
    }
  });
});

describe("getRequiredRole", () => {
  it("protects editorial pages and action routes with the intended role", () => {
    expect(getRequiredRole("/dashboard")).toBe("editor");
    expect(getRequiredRole("/approvals")).toBe("approver");
    expect(getRequiredRole("/settings")).toBe("admin");
    expect(getRequiredRole("/api/publications/task-1/approve", "POST")).toBe("approver");
    expect(getRequiredRole("/api/publications/task-1/request-approval", "POST")).toBe("editor");
    expect(getRequiredRole("/api/settings/integrations")).toBe("admin");
  });
});
