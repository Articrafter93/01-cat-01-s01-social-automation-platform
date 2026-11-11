import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/api/errors";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";
import {
  MAX_PUBLICATION_RETRIES,
  NOTHING_TO_RETRY,
  planRetry,
  retryBlockedReason,
  retryRefusal,
  retryTargets,
  shouldRequeueAttempt,
} from "@/lib/retry-policy";

const ASSET = { normalizedUrl: "https://news.example.com/a", canonicalDate: "2026-11-09" };
const key = (channel: "linkedin" | "facebook" | "instagram", approvedRevision: number) =>
  buildPublishIdempotencyKey({ ...ASSET, channel, accountId: `${channel}-main`, approvedRevision });

describe("retryRefusal", () => {
  it("allows a failed or partially published task under the retry limit", () => {
    expect(retryRefusal("failed", 0)).toBeNull();
    expect(retryRefusal("partially_published", MAX_PUBLICATION_RETRIES - 1)).toBeNull();
  });

  it("refuses every other status, and once the limit is used", () => {
    for (const status of ["draft", "processing", "needs_approval", "approved", "publishing", "published"] as const) {
      expect(retryRefusal(status, 0), status).toMatch(/Only failed or partially published/);
    }
    expect(retryRefusal("failed", MAX_PUBLICATION_RETRIES)).toMatch(/already used its/);
  });
});

describe("retryTargets", () => {
  it("targets the current revision of each approved channel only", () => {
    const targets = retryTargets({
      asset: ASSET,
      drafts: [
        { channel: "linkedin", approvedRevision: 1, requiresApproval: true },
        { channel: "linkedin", approvedRevision: 2, requiresApproval: true },
        { channel: "facebook", approvedRevision: 1, requiresApproval: true },
      ],
      approvals: [
        { channel: "linkedin", status: "approved" },
        { channel: "facebook", status: "pending" },
      ],
    });
    expect(targets.map((target) => target.idempotencyKey)).toEqual([key("linkedin", 2)]);
  });

  it("targets a channel without reviews only when its draft does not require approval", () => {
    // The app opens reviews for the direct channels only: X has no approval row.
    const targets = (requiresApproval: boolean) =>
      retryTargets({ asset: ASSET, drafts: [{ channel: "x", approvedRevision: 1, requiresApproval }], approvals: [] });
    expect(targets(false).map((target) => target.channel)).toEqual(["x"]);
    expect(targets(true)).toEqual([]);
  });

  it("needs every review of a channel approved, whatever its draft says", () => {
    const targets = (statuses: Array<"approved" | "pending" | "rejected">, requiresApproval = true) =>
      retryTargets({
        asset: ASSET,
        drafts: [{ channel: "linkedin", approvedRevision: 1, requiresApproval }],
        approvals: statuses.map((status) => ({ channel: "linkedin" as const, status })),
      });
    expect(targets(["approved", "approved"])).toHaveLength(1);
    expect(targets(["approved", "pending"])).toEqual([]);
    expect(targets(["rejected", "approved"])).toEqual([]);
    // A review row still gates the channel even if the draft says it skips approval.
    expect(targets(["pending"], false)).toEqual([]);
  });

  it("has no target without a source asset", () => {
    expect(retryTargets({ asset: null, drafts: [{ channel: "linkedin", approvedRevision: 1, requiresApproval: true }], approvals: [{ channel: "linkedin", status: "approved" }] })).toEqual([]);
  });
});

describe("planRetry", () => {
  const target = { channel: "linkedin" as const, accountId: "linkedin-main", idempotencyKey: key("linkedin", 2) };

  it("requeues the failed or draft attempts of current targets, never those of superseded revisions", () => {
    const plan = planRetry(
      [
        { id: "current", status: "failed", idempotencyKey: key("linkedin", 2) },
        { id: "superseded", status: "failed", idempotencyKey: key("linkedin", 1) },
        { id: "other-channel", status: "draft", idempotencyKey: key("facebook", 1) },
      ],
      [target],
    );
    expect(plan).toEqual({ requeueIds: ["current"], newAttempts: [] });
  });

  it("creates targets that never had an attempt, and returns null when there is nothing to do", () => {
    expect(planRetry([], [target])).toEqual({ requeueIds: [], newAttempts: [target] });
    expect(planRetry([{ id: "done", status: "published", idempotencyKey: target.idempotencyKey }], [target])).toBeNull();
    expect(planRetry([{ id: "waiting", status: "queued", idempotencyKey: target.idempotencyKey }], [target])).toBeNull();
    expect(planRetry([], [])).toBeNull();
  });

  it("gives the button the same answer as the API", () => {
    const publication = {
      status: "partially_published" as const,
      metrics: { retries: 0 },
      sourceAsset: ASSET,
      drafts: [{ channel: "linkedin" as const, approvedRevision: 2, requiresApproval: true }],
      approvals: [{ channel: "linkedin" as const, status: "approved" as const }],
      attempts: [{ id: "done", status: "published" as const, idempotencyKey: key("linkedin", 2) }],
    };
    expect(retryBlockedReason(publication)).toBe(NOTHING_TO_RETRY);
    expect(retryBlockedReason({ ...publication, attempts: [{ ...publication.attempts[0], status: "failed" }] })).toBeNull();
  });
});

describe("shouldRequeueAttempt", () => {
  it("requeues only failed or draft attempts", () => {
    expect(shouldRequeueAttempt("failed")).toBe(true);
    expect(shouldRequeueAttempt("draft")).toBe(true);
    expect(shouldRequeueAttempt("queued")).toBe(false);
    expect(shouldRequeueAttempt("published")).toBe(false);
  });
});

describe("retryDemoPublication (in-memory store)", () => {
  beforeEach(() => {
    // Hermetic: never touch a real Upstash store, whatever the shell has.
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });
  afterEach(() => vi.unstubAllEnvs());

  // task_001 as seeded: drafts linkedin rev 2, facebook rev 2, instagram rev 1; linkedin approved,
  // facebook and instagram pending. Its attempts are replaced by the ones each test lists.
  async function task001(attempts: Array<{ id: string; channel: "linkedin" | "facebook"; revision: number; status: "failed" | "published" | "draft" }>) {
    const store = await import("@/server/repositories/in-memory-store");
    const { retryDemoPublication } = await import("@/server/repositories/demo-store");
    const asset = store.sourceAssets.filter((entry) => entry.taskId === "task_001").sort((a, b) => b.canonicalDate.localeCompare(a.canonicalDate))[0];
    const keyFor = (channel: "linkedin" | "facebook", approvedRevision: number) =>
      buildPublishIdempotencyKey({ normalizedUrl: asset.normalizedUrl, canonicalDate: asset.canonicalDate, channel, accountId: `${channel}-main`, approvedRevision });
    for (let i = store.publishAttempts.length - 1; i >= 0; i--) {
      if (store.publishAttempts[i].taskId === "task_001") store.publishAttempts.splice(i, 1);
    }
    for (const attempt of attempts) {
      store.publishAttempts.push({ id: attempt.id, taskId: "task_001", channel: attempt.channel, accountId: `${attempt.channel}-main`, idempotencyKey: keyFor(attempt.channel, attempt.revision), status: attempt.status });
    }
    const task = store.publicationTasks.find((entry) => entry.id === "task_001")!;
    task.status = "partially_published";
    task.metrics.retries = 0;
    const attemptsOfTask = () => store.publishAttempts.filter((attempt) => attempt.taskId === "task_001").map((attempt) => `${attempt.id}:${attempt.status}`).sort();
    return { task, retry: () => retryDemoPublication("task_001"), attemptsOfTask };
  }

  it("refuses to retry a task that is already published", async () => {
    const store = await import("@/server/repositories/in-memory-store");
    const { retryDemoPublication } = await import("@/server/repositories/demo-store");
    const published = store.publicationTasks.find((task) => task.status === "published");
    const error = await retryDemoPublication(published!.id).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).status).toBe(409);
  });

  it("queues again only the current revision of an approved channel", async () => {
    const { task, retry, attemptsOfTask } = await task001([
      { id: "li-current", channel: "linkedin", revision: 2, status: "failed" },
      { id: "li-superseded", channel: "linkedin", revision: 1, status: "failed" },
      { id: "fb-unapproved", channel: "facebook", revision: 2, status: "failed" },
    ]);
    await retry();
    expect(attemptsOfTask()).toEqual(["fb-unapproved:failed", "li-current:queued", "li-superseded:failed"]);
    expect(task.status).toBe("processing");
    expect(task.metrics.retries).toBe(1);
  });

  it("answers 409 and changes nothing when the approved channel is already published", async () => {
    const { task, retry, attemptsOfTask } = await task001([
      { id: "li-current", channel: "linkedin", revision: 2, status: "published" },
      { id: "li-superseded", channel: "linkedin", revision: 1, status: "failed" },
    ]);
    const before = attemptsOfTask();
    const error = await retry().catch((caught: unknown) => caught);
    expect((error as DomainError).status).toBe(409);
    expect(task.status).toBe("partially_published");
    expect(task.metrics.retries).toBe(0);
    expect(attemptsOfTask()).toEqual(before);
  });

  it("queues again a failed X attempt whose draft skips review, and keeps it out when the draft needs one", async () => {
    const store = await import("@/server/repositories/in-memory-store");
    const { task, retry, attemptsOfTask } = await task001([{ id: "li-current", channel: "linkedin", revision: 2, status: "published" }]);
    const asset = store.sourceAssets.filter((entry) => entry.taskId === "task_001").sort((a, b) => b.canonicalDate.localeCompare(a.canonicalDate))[0];
    const xKey = buildPublishIdempotencyKey({ normalizedUrl: asset.normalizedUrl, canonicalDate: asset.canonicalDate, channel: "x", accountId: "x-main", approvedRevision: 1 });
    const draft = { id: "draft-x", taskId: "task_001", channel: "x" as const, headline: "X", body: "X", characterCount: 1, requiresApproval: true, approvedRevision: 1, validationWarnings: [] };
    store.channelDrafts.push(draft);
    store.publishAttempts.push({ id: "x-failed", taskId: "task_001", channel: "x", accountId: "x-main", idempotencyKey: xKey, status: "failed" });
    try {
      const error = await retry().catch((caught: unknown) => caught);
      expect((error as DomainError).status).toBe(409);
      draft.requiresApproval = false;
      await retry();
      expect(attemptsOfTask()).toEqual(["li-current:published", "x-failed:queued"]);
      expect(task.status).toBe("processing");
    } finally {
      store.channelDrafts.splice(store.channelDrafts.indexOf(draft), 1);
    }
  });

  it("stops at the retry limit", async () => {
    const { task, retry } = await task001([{ id: "li-current", channel: "linkedin", revision: 2, status: "failed" }]);
    task.metrics.retries = MAX_PUBLICATION_RETRIES;
    task.status = "failed";
    const error = await retry().catch((caught: unknown) => caught);
    expect((error as DomainError).status).toBe(409);
  });
});
