import { describe, expect, it } from "vitest";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";

describe("buildPublishIdempotencyKey", () => {
  it("keeps the same key for the same publication identity", () => {
    const input = {
      normalizedUrl: "https://example.com/article",
      canonicalDate: "2026-04-09",
      channel: "linkedin",
      accountId: "linkedin-main",
      approvedRevision: 2,
    };

    expect(buildPublishIdempotencyKey(input)).toBe(buildPublishIdempotencyKey(input));
  });

  it("changes when the revision changes", () => {
    const base = {
      normalizedUrl: "https://example.com/article",
      canonicalDate: "2026-04-09",
      channel: "linkedin",
      accountId: "linkedin-main",
    };

    expect(
      buildPublishIdempotencyKey({ ...base, approvedRevision: 1 }),
    ).not.toBe(buildPublishIdempotencyKey({ ...base, approvedRevision: 2 }));
  });
});
