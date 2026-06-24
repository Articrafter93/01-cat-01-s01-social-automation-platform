import type { UserRole } from "@/lib/types";

const sandboxDomain = "@antigravity.local";

export function resolveSandboxRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith(sandboxDomain)) {
    return "editor";
  }

  const [localPart] = normalized.split("@");

  if (localPart.includes("admin")) {
    return "admin";
  }

  if (localPart.includes("approver")) {
    return "approver";
  }

  return "editor";
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
