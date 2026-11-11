import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoAccount } from "@/lib/demo-accounts";
import type { UserRole } from "@/lib/types";

// Resolves a demo login to its account, or null. Only the listed demo accounts with the demo
// password get in, and the role comes from the account itself: an email cannot pick its own role
// by containing "admin", and an unknown email is rejected instead of becoming an editor.
export function resolveDemoAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((candidate) => candidate.email === normalized);
  if (!account || password !== DEMO_PASSWORD) {
    return null;
  }

  return account;
}

export function getRequiredRole(pathname: string, method = "GET"): UserRole | null {
  if (pathname.startsWith("/settings")) {
    return "admin";
  }

  if (pathname.startsWith("/observability")) {
    return "approver";
  }

  if (pathname.startsWith("/approvals")) {
    return "approver";
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/publications")
  ) {
    return "editor";
  }

  if (pathname.startsWith("/api/settings/")) {
    return "admin";
  }

  if (pathname.startsWith("/api/executions")) {
    return "approver";
  }

  if (pathname.startsWith("/api/publications/")) {
    if (method === "POST" && (pathname.endsWith("/approve") || pathname.endsWith("/reject") || pathname.endsWith("/retry"))) {
      return "approver";
    }

    return "editor";
  }

  if (pathname === "/api/publications") {
    return "editor";
  }

  return null;
}
