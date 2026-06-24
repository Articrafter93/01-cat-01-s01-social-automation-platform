import type { MetadataRoute } from "next";

const base = process.env.APP_BASE_URL ?? "https://social-automation.local";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/dashboard`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/approvals`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/history`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/observability`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/settings`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/privacidad`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
