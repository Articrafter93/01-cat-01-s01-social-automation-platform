import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Creating a Redis client at all would mean the test reached for the real Upstash service.
vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {
      throw new Error("The local fallback test must not create an Upstash client.");
    }
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => {
    throw new Error("Supabase client should not be created in local fallback mode.");
  },
  hasSupabaseServerConfig: () => false,
}));

describe("publication local fallback", () => {
  beforeEach(() => {
    process.env.ALLOWED_SCRAPE_HOSTS = "news.example.com";
    // Hermetic on purpose: whatever Upstash credentials the shell has, this test must use the pure
    // in-memory store and never call the real service. Empty values turn persistence off.
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates and lists publications without Supabase or Upstash credentials", async () => {
    const { isPersistenceEnabled } = await import("@/server/repositories/persistence");
    expect(isPersistenceEnabled()).toBe(false);

    const { createPublication, listPublications } = await import("@/server/services/publications-service");

    const created = await createPublication({
      sourceUrl: "https://news.example.com/article",
      sourceType: "article",
      brand: "Antigravity",
      locale: "en-US",
      tone: "Analytical premium",
      useAiImage: true,
      requestedChannels: ["linkedin", "facebook"],
    });

    const publications = await listPublications();

    expect(created.status).toBe("draft");
    expect(publications.some((publication) => publication.id === created.id)).toBe(true);
  });
});
