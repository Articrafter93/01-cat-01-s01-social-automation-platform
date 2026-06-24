import { beforeEach, describe, expect, it, vi } from "vitest";

const singleTask = {
  id: "task_001",
  correlation_id: "corr_123",
  source_url: "https://news.example.com/article",
  normalized_url: "https://news.example.com/article",
  source_type: "article",
  title: "Pendiente de extracción de fuente",
  status: "draft",
  brand: "Antigravity",
  locale: "es-CO",
  tone: "Premium analítico",
  use_ai_image: true,
  requested_channels: ["linkedin", "facebook"],
  created_at: "2026-04-09T10:00:00.000Z",
  updated_at: "2026-04-09T10:00:00.000Z",
  last_run_stage: "ingest",
  total_estimated_cost_usd: 0,
  total_latency_ms: 0,
  retry_count: 0,
};

const supabaseMock = {
  from: vi.fn((table: string) => {
    if (table === "publication_tasks") {
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: singleTask,
              error: null,
            }),
          })),
        })),
      };
    }

    return {
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => supabaseMock,
  hasSupabaseServerConfig: () => true,
}));

describe("createPublication", () => {
  beforeEach(() => {
    process.env.ALLOWED_SCRAPE_HOSTS = "news.example.com";
    supabaseMock.from.mockClear();
  });

  it("creates a draft task with correlation id", async () => {
    const { createPublication } = await import("@/server/services/publications-service");
    const task = await createPublication({
      sourceUrl: "https://news.example.com/article",
      sourceType: "article",
      brand: "Antigravity",
      locale: "es-CO",
      tone: "Premium analítico",
      useAiImage: true,
      requestedChannels: ["linkedin", "facebook"],
    });

    expect(task.status).toBe("draft");
    expect(task.correlationId).toBeTruthy();
    expect(supabaseMock.from).toHaveBeenCalledWith("publication_tasks");
    expect(supabaseMock.from).toHaveBeenCalledWith("approval_decisions");
    expect(supabaseMock.from).toHaveBeenCalledWith("execution_events");
  });
});


