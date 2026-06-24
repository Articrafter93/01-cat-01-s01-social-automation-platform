import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => {
    throw new Error("Supabase client should not be created in local fallback mode.");
  },
  hasSupabaseServerConfig: () => false,
}));

describe("publication local fallback", () => {
  beforeEach(() => {
    process.env.ALLOWED_SCRAPE_HOSTS = "news.example.com";
  });

  it("creates and lists publications without Supabase credentials", async () => {
    const { createPublication, listPublications } = await import("@/server/services/publications-service");

    const created = await createPublication({
      sourceUrl: "https://news.example.com/article",
      sourceType: "article",
      brand: "Antigravity",
      locale: "es-CO",
      tone: "Premium analítico",
      useAiImage: true,
      requestedChannels: ["linkedin", "facebook"],
    });

    const publications = await listPublications();

    expect(created.status).toBe("draft");
    expect(publications.some((publication) => publication.id === created.id)).toBe(true);
  });
});
