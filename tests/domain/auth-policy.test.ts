import { describe, expect, it } from "vitest";
import { getRequiredRole, resolveSandboxRole } from "@/server/auth/policy";

describe("resolveSandboxRole", () => {
  it("maps sandbox identities to the expected role", () => {
    expect(resolveSandboxRole("editor@antigravity.local")).toBe("editor");
    expect(resolveSandboxRole("approver@antigravity.local")).toBe("approver");
    expect(resolveSandboxRole("admin@antigravity.local")).toBe("admin");
  });

  it("falls back to editor for unknown domains", () => {
    expect(resolveSandboxRole("someone@example.com")).toBe("editor");
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
