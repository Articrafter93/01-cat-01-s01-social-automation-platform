import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasRole } from "@/server/auth/rbac";
import { DomainError } from "@/lib/api/errors";
import type { UserRole } from "@/lib/types";

/**
 * Authoritative authorization boundary (Node runtime).
 *
 * RBAC is enforced here — in the route handlers and pages that run in the
 * Node.js runtime — rather than in Edge middleware. Edge middleware cannot
 * decode the (encrypted) Auth.js session without pulling Node-only crypto into
 * the Edge bundle, and middleware-only authorization is fragile besides. The
 * middleware provides only a coarse unauthenticated redirect; these guards are
 * the real boundary and run on every protected request.
 */

async function resolveRole(): Promise<{ role: UserRole } | null> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return { role: (user.role ?? "editor") as UserRole };
}

/**
 * For API route handlers. Throws a {@link DomainError} (401/403) that
 * `handleRouteError` maps to a JSON response. Call inside the handler's
 * try/catch before any work.
 */
export async function requireApiRole(minimumRole: UserRole): Promise<UserRole> {
  const resolved = await resolveRole();

  if (!resolved) {
    throw new DomainError("Authentication required", 401);
  }

  if (!hasRole(resolved.role, minimumRole)) {
    throw new DomainError("Forbidden", 403);
  }

  return resolved.role;
}

/**
 * For server-component pages. Redirects unauthenticated users to /login and
 * under-privileged users back to /dashboard. The denied redirect carries the
 * attempted path and the role it requires as query params, so the dashboard can
 * surface an explicit "access denied" notice instead of bouncing the user
 * silently (a silent bounce reads as a bug to anyone evaluating the app).
 */
export async function requirePageRole(minimumRole: UserRole, pathname: string): Promise<UserRole> {
  const resolved = await resolveRole();

  if (!resolved) {
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  if (!hasRole(resolved.role, minimumRole)) {
    redirect(`/dashboard?denied=${encodeURIComponent(pathname)}&need=${minimumRole}`);
  }

  return resolved.role;
}
