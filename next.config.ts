import type { NextConfig } from "next";

// Next.js Fast Refresh (dev) compiles modules through eval(), which requires
// 'unsafe-eval' in the script-src directive. We allow it ONLY in development so
// the production CSP stays strict (no eval in shipped code).
const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https:",
].join("; ") + ";";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
