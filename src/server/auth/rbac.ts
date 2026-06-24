import type { UserRole } from "@/lib/types";

const roleOrder: UserRole[] = ["editor", "approver", "admin"];

export function hasRole(currentRole: UserRole, minimumRole: UserRole) {
  return roleOrder.indexOf(currentRole) >= roleOrder.indexOf(minimumRole);
}
