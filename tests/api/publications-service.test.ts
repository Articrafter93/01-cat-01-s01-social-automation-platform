import { beforeEach, describe, expect, it, vi } from "vitest";

// Set before the first module import so the service's module-level
// allowedSourceHosts variable is evaluated with this value.
process.env.ALLOWED_SCRAPE_HOSTS = "news.example.com";

// Captures the data the service actually computes and passes to the insert,
// so assertions reflect service behavior rather than mock fixture values.
let capturedInsert: Record<string, unknown> | null = null;

const supabaseMock = {
  from: vi.fn((table: string) => {
    if (table === "publication_tasks") {
      return {
        insert: vi.fn((data: Record<string, unknown>) => {
          capturedInsert = data;
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...data,
                  id: "task_001",
                  created_at: "2026-01-01T00:00:00.000Z",
                  updated_at: "2026-01-01T00:00:00.000Z",
                },
                error: null,
              }),
            })),
          };
        }),
      };
    }
    return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => supabaseMock,
  hasSupabaseServerConfig: () => true,
}));

const validInput = {
  sourceUrl: "https://news.example.com/article",
  sourceType: "article",
  brand: "Antigravity",
  locale: "en-US",
  tone: "Analytical premium",
  useAiImage: true,
  requestedChannels: ["linkedin", "facebook"],
};

describe("createPublication — schema validation", () => {
  beforeEach(() => {
    capturedInsert = null;
    supabaseMock.from.mockClear();
  });

  it("rejects input with a missing required field without touching the database", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    const { sourceType: _omit, ...withoutSourceType } = validInput;
    await expect(createPublication(withoutSourceType)).rejects.toThrow();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("rejects a non-HTTP(S) source URL without touching the database", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await expect(
      createPublication({ ...validInput, sourceUrl: "ftp://news.example.com/file" }),
    ).rejects.toThrow();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});

describe("createPublication — URL safety enforcement", () => {
  beforeEach(() => {
    capturedInsert = null;
    supabaseMock.from.mockClear();
  });

  it("blocks the cloud metadata endpoint before writing to the database", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await expect(
      createPublication({ ...validInput, sourceUrl: "http://169.254.169.254/latest/meta-data/" }),
    ).rejects.toThrow(/blocked/i);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("rejects a URL from a host outside the configured allowlist before writing to the database", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await expect(
      createPublication({ ...validInput, sourceUrl: "https://not-in-allowlist.com/article" }),
    ).rejects.toThrow(/allowlist/i);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});

describe("createPublication — persisted values", () => {
  beforeEach(() => {
    capturedInsert = null;
    supabaseMock.from.mockClear();
  });

  it("always sets the initial status to draft regardless of input", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await createPublication(validInput);
    expect(capturedInsert?.status).toBe("draft");
  });

  it("generates a correlation ID with the corr_ prefix and a timestamp component", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await createPublication(validInput);
    expect(String(capturedInsert?.correlation_id)).toMatch(/^corr_\d+_[a-z0-9]+$/);
  });

  it("persists a lowercase normalized URL regardless of the original casing", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    await createPublication({ ...validInput, sourceUrl: "https://news.example.com/Article?Ref=TEST" });
    expect(capturedInsert?.normalized_url).toBe("https://news.example.com/article?ref=test");
  });
});
