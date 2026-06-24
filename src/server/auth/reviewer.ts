import { auth } from "@/auth";

/**
 * Resolve the reviewer identity from the authenticated session.
 *
 * Approval/rejection actions must attribute the decision to the signed-in
 * user, never to a client-supplied value. The middleware already guarantees
 * the caller holds the `approver` role; this guarantees the recorded reviewer
 * matches that authenticated principal so the audit trail cannot be forged.
 */
export async function resolveReviewerIdentity(): Promise<string | null> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const identity = user.email ?? user.name;
  return identity && identity.trim().length > 0 ? identity.trim() : null;
}
