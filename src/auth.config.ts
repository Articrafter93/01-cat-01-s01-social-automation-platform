import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { resolveSandboxRole } from "@/server/auth/policy";

const signInSchema = z.object({
  email: z.string().email(),
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

        if (process.env.NODE_ENV === "production") {
          return null;
        }

        const role = resolveSandboxRole(parsed.data.email);

        return {
          id: `bootstrap-${role}`,
          email: parsed.data.email,
          name: "Bootstrap User",
          role,
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
