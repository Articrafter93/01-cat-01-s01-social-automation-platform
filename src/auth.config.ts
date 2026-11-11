import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { hasSupabaseServerConfig } from "@/lib/supabase/config";
import { resolveDemoAccount } from "@/server/auth/policy";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

/**
 * Edge-safe Auth.js configuration shared by the server instance (`auth.ts`)
 * and the middleware. Keeping providers/callbacks here lets the middleware
 * initialize its own NextAuth instance without pulling in server-only
 * dependencies.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Internal SSO",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        // Sandbox demo auth is blocked in production by default so a real
        // production deploy never ships a live mock login. It is re-enabled
        // ONLY when explicitly opted in for the sandbox exhibition (no real
        // data: fallback-local store). The opt-in is deliberate per deploy.
        const demoAuthEnabled =
          process.env.NEXT_PUBLIC_DEMO_AUTH === "enabled" ||
          process.env.DATA_SOURCE_MODE === "local";

        if (process.env.NODE_ENV === "production" && !demoAuthEnabled) {
          return null;
        }

        // The demo accounts have a public password, so they must never reach real data: a
        // production build with a Supabase backend configured has no demo login at all.
        if (process.env.NODE_ENV === "production" && hasSupabaseServerConfig()) {
          return null;
        }

        // Only the demo accounts with the demo password; the role comes from the account.
        const account = resolveDemoAccount(parsed.data.email, parsed.data.password);
        if (!account) {
          return null;
        }

        return {
          id: `bootstrap-${account.role}`,
          email: account.email,
          name: "Bootstrap User",
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "admin" | "editor" | "approver" | undefined) ?? "editor";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
