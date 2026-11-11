import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";
import { retryBlockedReason } from "@/lib/retry-policy";

// Both seeds include task_003, a partially published task whose Facebook attempt failed, so the
// exhibition always has a publication the Retry button can act on. Without it no seeded task is in
// a retryable state and the button is always disabled.
const SOURCE = { normalizedUrl: "https://example.com/insights/retry-ready-editorial-calendar", canonicalDate: "2026-04-10" };
const keyFor = (channel: "linkedin" | "facebook") =>
  buildPublishIdempotencyKey({ ...SOURCE, channel, accountId: `${channel}-main`, approvedRevision: 1 });

describe("seeded retry-ready publication (demo store)", () => {
  beforeEach(() => {
    // Hermetic: the demo store never reaches a real Upstash store, whatever the shell has.
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("opens with Retry enabled, and a retry queues only the failed channel again", async () => {
    const { getDemoPublicationById, retryDemoPublication } = await import("@/server/repositories/demo-store");
    const before = await getDemoPublicationById("task_003");
    expect(before?.status).toBe("partially_published");
    expect(retryBlockedReason(before!)).toBeNull();

    await retryDemoPublication("task_003");

    const after = await getDemoPublicationById("task_003");
    expect(after?.status).toBe("processing");
    expect(after?.attempts.map((attempt) => `${attempt.channel}:${attempt.status}`).sort()).toEqual(["facebook:queued", "linkedin:published"]);
    // The failed attempt was requeued with its own key: no second Facebook attempt was created.
    expect(after?.attempts.find((attempt) => attempt.channel === "facebook")?.idempotencyKey).toBe(keyFor("facebook"));
  });
});

describe("seeded retry-ready publication (Supabase seed)", () => {
  const seed = readFileSync(fileURLToPath(new URL("../../supabase/seed.sql", import.meta.url)), "utf8");
  const block = seed.slice(seed.indexOf("with task_three as"), seed.indexOf("insert into prompt_templates"));

  it("seeds the same task, partially published, with both channels approved", () => {
    expect(block).toContain("'corr_20260410_003'");
    expect(block).toContain("'partially_published'");
    expect(block).toContain(`'${SOURCE.normalizedUrl}', date '${SOURCE.canonicalDate}'`);
    expect(block.match(/'(linkedin|facebook)', 'approved'/g)).toHaveLength(2);
  });

  it("uses the idempotency keys the app computes, so a retry requeues the failed attempt", () => {
    expect(block).toMatch(new RegExp(`'linkedin', 'linkedin-main', '${keyFor("linkedin")}', 'published'`));
    expect(block).toMatch(new RegExp(`'facebook', 'facebook-main', '${keyFor("facebook")}', 'failed'`));
  });
});
