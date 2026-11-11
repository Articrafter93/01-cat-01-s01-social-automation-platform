import type { UserRole } from "@/lib/types";

// Sandbox demo accounts for the portfolio exhibition, shared by the login page (selector and
// prefilled password) and by the credentials check in auth.config.ts, so the two cannot drift.
// The password is public on purpose: the login page prefills it (demo-auth exception). These are
// never real credentials.
export const DEMO_PASSWORD = "demo-access";

export interface DemoAccount {
  email: string;
  role: UserRole;
  label: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: "editor@antigravity.local", role: "editor", label: "Editor — creates and requests approval" },
  { email: "approver@antigravity.local", role: "approver", label: "Approver — approves and watches" },
  { email: "admin@antigravity.local", role: "admin", label: "Admin — internal configuration" },
];
