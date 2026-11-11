import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/api/errors";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";

// retryPublication on the Supabase path, against a small in-memory fake of the query builder. The
// fake applies the filters each call sends (eq, in, lt) to its rows, so the conditional UPDATEs run
// for real here. It does not prove Postgres's own atomicity: that rests on a single UPDATE ... WHERE.
type Row = Record<string, unknown>;
type Filter = { op: "eq" | "in" | "lt"; column: string; value: unknown };

const { db, failInsertInto, concurrentRetry, failAttemptRollback } = vi.hoisted(() => ({
  db: {} as Record<string, Row[]>,
  failInsertInto: { table: "" },
  // When set, another request bumps the task's retry_count just before this request's claim runs.
  concurrentRetry: { value: false },
  // When set, the UPDATE that puts a requeued attempt back fails, with this error code.
  failAttemptRollback: { value: false, code: "08006" },
}));

function matches(row: Row, filters: Filter[]) {
  return filters.every(({ op, column, value }) =>
    op === "eq" ? row[column] === value : op === "in" ? (value as unknown[]).includes(row[column]) : (row[column] as number) < (value as number),
  );
}

function query(table: string) {
  let op: "select" | "update" | "insert" | "delete" = "select";
  let payload: Row | null = null;
  let mode: "many" | "single" | "maybeSingle" = "many";
  const filters: Filter[] = [];
  const builder = {
    select: () => builder,
    order: () => builder,
    limit: () => builder,
    update: (values: Row) => ((op = "update"), (payload = values), builder),
    insert: (values: Row | Row[]) => ((op = "insert"), (payload = values as Row), builder),
    delete: () => ((op = "delete"), builder),
    eq: (column: string, value: unknown) => (filters.push({ op: "eq", column, value }), builder),
    in: (column: string, value: unknown[]) => (filters.push({ op: "in", column, value }), builder),
    lt: (column: string, value: number) => (filters.push({ op: "lt", column, value }), builder),
    single: () => ((mode = "single"), builder),
    maybeSingle: () => ((mode = "maybeSingle"), builder),
    then(resolve: (result: { data: unknown; error: { message: string } | null }) => unknown) {
      const rows = (db[table] ??= []);
      if (op === "insert") {
        if (failInsertInto.table === table) return resolve({ data: null, error: { message: "insert failed" } });
        for (const value of Array.isArray(payload) ? payload : [payload]) rows.push({ ...value });
        return resolve({ data: null, error: null });
      }
      if (op === "delete") {
        db[table] = rows.filter((row) => !matches(row, filters));
        return resolve({ data: null, error: null });
      }
      if (op === "update" && table === "publish_attempts" && payload?.status !== "queued" && failAttemptRollback.value) {
        return resolve({ data: null, error: { message: "update failed", code: failAttemptRollback.code } as { message: string } });
      }
      if (op === "update" && table === "publication_tasks" && payload?.status === "processing" && concurrentRetry.value) {
        rows.forEach((row) => (row.retry_count = (row.retry_count as number) + 1));
      }
      const hit = rows.filter((row) => matches(row, filters));
      if (op === "update") hit.forEach((row) => Object.assign(row, payload));
      const data = mode === "many" ? hit.map((row) => ({ ...row })) : hit[0] ? { ...hit[0] } : null;
      return resolve({ data, error: null });
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  hasSupabaseServerConfig: () => true,
  getSupabaseServerClient: () => ({ from: query }),
}));

const { getPublicationById, retryPublication } = await import("@/server/services/publications-service");

const TASK = {
  id: "task_1",
  correlation_id: "corr_1",
  source_url: "https://news.example.com/a",
  normalized_url: "https://news.example.com/a",
  source_type: "article",
  title: "A",
  status: "partially_published",
  brand: "Acme",
  locale: "en-US",
  tone: "calm",
  use_ai_image: false,
  requested_channels: ["linkedin", "facebook"],
  total_estimated_cost_usd: 0,
  total_latency_ms: 0,
  retry_count: 0,
  last_run_stage: "publish-channel",
  created_at: "2026-11-10T00:00:00.000Z",
  updated_at: "2026-11-10T00:00:00.000Z",
};

// Real keys, as the publisher computes them, so the retry plan recognises each seeded attempt as the
// attempt of its channel's current draft.
const key = (channel: "linkedin" | "facebook" | "x", approvedRevision = 1) =>
  buildPublishIdempotencyKey({
    normalizedUrl: TASK.normalized_url,
    canonicalDate: "2026-11-09",
    channel,
    accountId: `${channel}-main`,
    approvedRevision,
  });

beforeEach(() => {
  failInsertInto.table = "";
  failAttemptRollback.value = false;
  failAttemptRollback.code = "08006";
  db.publication_tasks = [{ ...TASK }];
  db.source_assets = [{ id: "asset_1", task_id: "task_1", normalized_url: TASK.normalized_url, canonical_date: "2026-11-09" }];
  db.channel_drafts = [
    { id: "draft_li", task_id: "task_1", channel: "linkedin", approved_revision: 1, requires_approval: true },
    { id: "draft_fb", task_id: "task_1", channel: "facebook", approved_revision: 1, requires_approval: true },
  ];
  db.approval_decisions = [
    { task_id: "task_1", channel: "linkedin", status: "approved" },
    { task_id: "task_1", channel: "facebook", status: "approved" },
  ];
  db.publish_attempts = [
    { id: "att_li", task_id: "task_1", channel: "linkedin", status: "published", idempotency_key: key("linkedin"), last_error: null },
    { id: "att_fb", task_id: "task_1", channel: "facebook", status: "failed", idempotency_key: key("facebook"), last_error: "timeout" },
  ];
  db.execution_events = [];
});

describe("retryPublication on Supabase", () => {
  it("queues again only the failed channel of a partially published task", async () => {
    const task = await retryPublication("task_1");
    expect(task?.status).toBe("processing");
    expect(db.publication_tasks[0].retry_count).toBe(1);
    expect(db.publish_attempts.find((a) => a.id === "att_fb")!.status).toBe("queued");
    expect(db.publish_attempts.find((a) => a.id === "att_li")!.status).toBe("published");
    expect(db.publish_attempts).toHaveLength(2);
    expect(db.execution_events).toHaveLength(1);
  });

  it("answers 409 and changes nothing when every channel is already published", async () => {
    db.publish_attempts[1].status = "published";
    const error = await retryPublication("task_1").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).status).toBe(409);
    expect(db.publication_tasks[0]).toMatchObject({ status: "partially_published", retry_count: 0 });
    expect(db.execution_events).toHaveLength(0);
  });

  it("answers 409 when the task changed between the read and the claim", async () => {
    concurrentRetry.value = true;
    const error = await retryPublication("task_1").catch((caught: unknown) => caught);
    concurrentRetry.value = false;
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).status).toBe(409);
    expect(db.publish_attempts.find((a) => a.id === "att_fb")!.status).toBe("failed");
    expect(db.execution_events).toHaveLength(0);
  });

  it("puts the task and the requeued attempt back, error included, when a write after the claim fails", async () => {
    failInsertInto.table = "execution_events";
    await expect(retryPublication("task_1")).rejects.toThrow(/insert failed/);
    expect(db.publication_tasks[0]).toMatchObject({ status: "partially_published", retry_count: 0 });
    expect(db.publish_attempts.find((a) => a.id === "att_fb")).toMatchObject({ status: "failed", last_error: "timeout" });
  });

  it("logs a rollback write that fails, by its error code only, and still reports the original error", async () => {
    failInsertInto.table = "execution_events";
    failAttemptRollback.value = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(retryPublication("task_1")).rejects.toThrow(/insert failed/);
    expect(errors).toHaveBeenCalledWith("[retry] rollback of a requeued attempt failed", "08006");
    // A network error can come back with an empty code: the log says "unknown" instead.
    failAttemptRollback.code = "";
    db.publication_tasks[0] = { ...TASK };
    db.publish_attempts[1].status = "failed";
    await expect(retryPublication("task_1")).rejects.toThrow(/insert failed/);
    expect(errors).toHaveBeenLastCalledWith("[retry] rollback of a requeued attempt failed", "unknown");
    errors.mockRestore();
    // The task rollback still ran.
    expect(db.publication_tasks[0]).toMatchObject({ status: "partially_published", retry_count: 0 });
  });

  it("retries a channel without reviews when its draft does not require approval", async () => {
    // X gets no approval row: only the direct channels are reviewed. Its draft skips review.
    db.channel_drafts.push({ id: "draft_x", task_id: "task_1", channel: "x", approved_revision: 1, requires_approval: false });
    db.publish_attempts[1].status = "published";
    db.publish_attempts.push({ id: "att_x", task_id: "task_1", channel: "x", status: "failed", idempotency_key: key("x"), last_error: "rate limited" });
    await retryPublication("task_1");
    expect(db.publish_attempts.find((a) => a.id === "att_x")).toMatchObject({ status: "queued", last_error: null });
  });

  it("keeps a channel without reviews out when its draft requires approval or does not say", async () => {
    db.publish_attempts[1].status = "published";
    db.publish_attempts.push({ id: "att_x", task_id: "task_1", channel: "x", status: "failed", idempotency_key: key("x"), last_error: null });
    for (const requires_approval of [true, null]) {
      db.channel_drafts = db.channel_drafts.filter((draft) => draft.channel !== "x");
      db.channel_drafts.push({ id: "draft_x", task_id: "task_1", channel: "x", approved_revision: 1, requires_approval });
      const error = await retryPublication("task_1").catch((caught: unknown) => caught);
      expect((error as DomainError).status, String(requires_approval)).toBe(409);
      expect(db.publish_attempts.find((a) => a.id === "att_x")!.status).toBe("failed");
    }
  });

  it("never republishes a superseded revision or a channel that is not approved", async () => {
    // Facebook moved to revision 2 (already published) and LinkedIn's approval is still pending:
    // the failed revision-1 Facebook attempt and the LinkedIn channel are not retry targets.
    db.channel_drafts.push({ id: "draft_fb2", task_id: "task_1", channel: "facebook", approved_revision: 2, requires_approval: true });
    db.publish_attempts.push({
      id: "att_fb2",
      task_id: "task_1",
      channel: "facebook",
      status: "published",
      idempotency_key: buildPublishIdempotencyKey({
        normalizedUrl: TASK.normalized_url,
        canonicalDate: "2026-11-09",
        channel: "facebook",
        accountId: "facebook-main",
        approvedRevision: 2,
      }),
    });
    db.approval_decisions[0].status = "pending";
    db.publish_attempts[0].status = "failed";

    const error = await retryPublication("task_1").catch((caught: unknown) => caught);
    expect((error as DomainError).status).toBe(409);
    expect(db.publish_attempts.map((a) => `${a.id}:${a.status}`)).toEqual(["att_li:failed", "att_fb:failed", "att_fb2:published"]);
    expect(db.publication_tasks[0]).toMatchObject({ status: "partially_published", retry_count: 0 });
  });

  it("reads a draft whose requires_approval is missing as gated, like the retry does", async () => {
    db.channel_drafts[0].requires_approval = null;
    const publication = await getPublicationById("task_1");
    expect(publication?.drafts.find((draft) => draft.channel === "linkedin")?.requiresApproval).toBe(true);
  });
});
