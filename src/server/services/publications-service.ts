import { publicationCreateSchema } from "@/lib/schemas";
import { assertSafeSourceUrl } from "@/lib/security/url-policy";
import { getSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { ApprovalDecision, Channel, ChannelDraft, ExecutionEvent, PublicationTask, PublishAttempt, SourceAsset } from "@/lib/types";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";
import {
  approveDemoPublication,
  createDemoPublication,
  getDemoPublicationById,
  listDemoApprovals,
  listDemoDrafts,
  listDemoPublications,
  rejectDemoPublication,
  requestDemoApproval,
  retryDemoPublication,
} from "@/server/repositories/demo-store";

const directChannels: Channel[] = ["linkedin", "facebook", "instagram"];
const allowedSourceHosts =
  process.env.ALLOWED_SCRAPE_HOSTS?.split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean) ?? [];

type TaskRow = {
  id: string;
  correlation_id: string;
  source_url: string;
  normalized_url: string;
  source_type: "article" | "youtube";
  title: string;
  status: PublicationTask["status"];
  brand: string;
  locale: string;
  tone: string;
  use_ai_image: boolean;
  requested_channels: Channel[];
  total_estimated_cost_usd: number;
  total_latency_ms: number;
  retry_count: number;
  last_run_stage: string;
  created_at: string;
  updated_at: string;
};

type SourceAssetRow = {
  id: string;
  task_id: string;
  source_type: "article" | "youtube";
  normalized_url: string;
  canonical_date: string;
  title: string;
  author: string | null;
  summary: string | null;
  transcript_status: SourceAsset["transcriptStatus"];
  extraction_status: SourceAsset["extractionStatus"];
};

type ChannelDraftRow = {
  id: string;
  task_id: string;
  channel: Channel;
  headline: string;
  body: string;
  character_count: number;
  requires_approval: boolean;
  approved_revision: number;
  validation_warnings: string[];
  image_prompt: string | null;
};

type ApprovalDecisionRow = {
  id: string;
  task_id: string;
  channel: Channel;
  status: ApprovalDecision["status"];
  reviewer_name: string | null;
  reviewed_at: string | null;
  note: string | null;
};

type PublishAttemptRow = {
  id: string;
  task_id: string;
  channel: Channel;
  account_id: string;
  idempotency_key: string;
  status: PublishAttempt["status"];
  published_at: string | null;
  external_post_id: string | null;
  last_error: string | null;
};

type ExecutionEventRow = {
  id: string;
  task_id: string;
  stage: string;
  status: ExecutionEvent["status"];
  message: string;
  created_at: string;
  latency_ms: number;
  estimated_cost_usd: number;
};

function buildCorrelationId() {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapTask(row: TaskRow): PublicationTask {
  return {
    id: row.id,
    correlationId: row.correlation_id,
    sourceUrl: row.source_url,
    normalizedUrl: row.normalized_url,
    sourceType: row.source_type,
    title: row.title,
    status: row.status,
    brand: row.brand,
    locale: row.locale,
    tone: row.tone,
    useAiImage: row.use_ai_image,
    requestedChannels: row.requested_channels,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastRunStage: row.last_run_stage,
    metrics: {
      totalEstimatedCostUsd: row.total_estimated_cost_usd,
      totalLatencyMs: row.total_latency_ms,
      retries: row.retry_count,
    },
  };
}

function mapSourceAsset(row: SourceAssetRow): SourceAsset {
  return {
    id: row.id,
    taskId: row.task_id,
    sourceType: row.source_type,
    normalizedUrl: row.normalized_url,
    canonicalDate: row.canonical_date,
    title: row.title,
    author: row.author ?? undefined,
    summary: row.summary ?? undefined,
    transcriptStatus: row.transcript_status,
    extractionStatus: row.extraction_status,
  };
}

function mapDraft(row: ChannelDraftRow): ChannelDraft {
  return {
    id: row.id,
    taskId: row.task_id,
    channel: row.channel,
    headline: row.headline,
    body: row.body,
    characterCount: row.character_count,
    requiresApproval: row.requires_approval,
    approvedRevision: row.approved_revision,
    validationWarnings: row.validation_warnings,
    imagePrompt: row.image_prompt ?? undefined,
  };
}

function mapApproval(row: ApprovalDecisionRow): ApprovalDecision {
  return {
    id: row.id,
    taskId: row.task_id,
    channel: row.channel,
    status: row.status,
    reviewer: row.reviewer_name ?? "Pending",
    reviewedAt: row.reviewed_at ?? undefined,
    note: row.note ?? undefined,
  };
}

function mapAttempt(row: PublishAttemptRow): PublishAttempt {
  return {
    id: row.id,
    taskId: row.task_id,
    channel: row.channel,
    accountId: row.account_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    externalPostId: row.external_post_id ?? undefined,
    lastError: row.last_error ?? undefined,
  };
}

function mapEvent(row: ExecutionEventRow): ExecutionEvent {
  return {
    id: row.id,
    taskId: row.task_id,
    stage: row.stage,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
    latencyMs: row.latency_ms,
    estimatedCostUsd: row.estimated_cost_usd,
  };
}

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

async function loadDraftMap(taskIds: string[]) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("channel_drafts")
    .select("*")
    .in("task_id", taskIds)
    .order("channel", { ascending: true });

  assertNoError(error);

  return (data as ChannelDraftRow[]).reduce<Record<string, ChannelDraft[]>>((acc, row) => {
    acc[row.task_id] = acc[row.task_id] ?? [];
    acc[row.task_id].push(mapDraft(row));
    return acc;
  }, {});
}

async function loadApprovalMap(taskIds: string[]) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("approval_decisions").select("*").in("task_id", taskIds);
  assertNoError(error);

  return (data as ApprovalDecisionRow[]).reduce<Record<string, ApprovalDecision[]>>((acc, row) => {
    acc[row.task_id] = acc[row.task_id] ?? [];
    acc[row.task_id].push(mapApproval(row));
    return acc;
  }, {});
}

export async function listPublications() {
  if (!hasSupabaseServerConfig()) {
    return listDemoPublications();
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("publication_tasks").select("*").order("created_at", { ascending: false });
  assertNoError(error);

  const tasks = (data as TaskRow[]) ?? [];
  if (tasks.length === 0) {
    return [];
  }

  const taskIds = tasks.map((task) => task.id);
  const [draftMap, approvalMap] = await Promise.all([loadDraftMap(taskIds), loadApprovalMap(taskIds)]);

  return tasks.map((task) => ({
    ...mapTask(task),
    drafts: draftMap[task.id] ?? [],
    approvals: approvalMap[task.id] ?? [],
  }));
}

export async function getPublicationById(id: string) {
  if (!hasSupabaseServerConfig()) {
    return getDemoPublicationById(id);
  }

  const supabase = getSupabaseServerClient();
  const [{ data: task, error: taskError }, { data: sourceAssets, error: sourceError }, { data: drafts, error: draftsError }, { data: approvals, error: approvalsError }, { data: attempts, error: attemptsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase.from("publication_tasks").select("*").eq("id", id).single(),
      supabase.from("source_assets").select("*").eq("task_id", id).order("canonical_date", { ascending: false }).limit(1),
      supabase.from("channel_drafts").select("*").eq("task_id", id).order("channel", { ascending: true }),
      supabase.from("approval_decisions").select("*").eq("task_id", id),
      supabase.from("publish_attempts").select("*").eq("task_id", id).order("created_at", { ascending: false }),
      supabase.from("execution_events").select("*").eq("task_id", id).order("created_at", { ascending: false }),
    ]);

  if (taskError?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(taskError);
  assertNoError(sourceError);
  assertNoError(draftsError);
  assertNoError(approvalsError);
  assertNoError(attemptsError);
  assertNoError(eventsError);

  const typedTask = task as TaskRow | null;
  if (!typedTask) {
    return null;
  }

  return {
    ...mapTask(typedTask),
    sourceAsset: (sourceAssets as SourceAssetRow[])[0] ? mapSourceAsset((sourceAssets as SourceAssetRow[])[0]) : null,
    drafts: ((drafts as ChannelDraftRow[]) ?? []).map(mapDraft),
    approvals: ((approvals as ApprovalDecisionRow[]) ?? []).map(mapApproval),
    attempts: ((attempts as PublishAttemptRow[]) ?? []).map(mapAttempt),
    events: ((events as ExecutionEventRow[]) ?? []).map(mapEvent),
  };
}

export async function createPublication(input: unknown) {
  const parsed = publicationCreateSchema.parse(input);
  const safeSource = assertSafeSourceUrl(parsed.sourceUrl, allowedSourceHosts);

  if (!hasSupabaseServerConfig()) {
    return createDemoPublication(parsed, safeSource.toString().toLowerCase());
  }

  const supabase = getSupabaseServerClient();

  const { data: task, error: taskError } = await supabase
    .from("publication_tasks")
    .insert({
      correlation_id: buildCorrelationId(),
      source_url: parsed.sourceUrl,
      normalized_url: safeSource.toString().toLowerCase(),
      source_type: parsed.sourceType,
      title: "Pending source extraction",
      status: "draft",
      brand: parsed.brand,
      locale: parsed.locale,
      tone: parsed.tone,
      use_ai_image: parsed.useAiImage,
      requested_channels: parsed.requestedChannels,
      total_estimated_cost_usd: 0,
      total_latency_ms: 0,
      retry_count: 0,
      last_run_stage: "ingest",
    })
    .select("*")
    .single();

  assertNoError(taskError);

  const typedTask = task as TaskRow;
  const approvalChannels = parsed.requestedChannels.filter((channel) => directChannels.includes(channel));

  if (approvalChannels.length > 0) {
    const { error } = await supabase.from("approval_decisions").insert(
      approvalChannels.map((channel) => ({
        task_id: typedTask.id,
        channel,
        status: "pending",
      })),
    );

    assertNoError(error);
  }

  const { error: eventError } = await supabase.from("execution_events").insert({
    task_id: typedTask.id,
    stage: "ingest",
    status: "ok",
    message: "Task created from the panel and sent to orchestration.",
    latency_ms: 30,
    estimated_cost_usd: 0,
  });

  assertNoError(eventError);

  return mapTask(typedTask);
}

export async function requestApproval(id: string, reviewer: string, note?: string) {
  if (!hasSupabaseServerConfig()) {
    return requestDemoApproval(id, reviewer, note);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("publication_tasks")
    .update({
      status: "needs_approval",
      last_run_stage: "editorial-gate",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(error);

  const { error: eventError } = await supabase.from("execution_events").insert({
    task_id: id,
    stage: "request-approval",
    status: "needs_approval",
    message: note ?? `Approval requested by ${reviewer}.`,
    latency_ms: 42,
    estimated_cost_usd: 0,
  });

  assertNoError(eventError);

  return mapTask(data as TaskRow);
}

export async function approvePublication(id: string, reviewer: string, note?: string, channel?: Channel) {
  if (!hasSupabaseServerConfig()) {
    return approveDemoPublication(id, reviewer, note, channel);
  }

  const supabase = getSupabaseServerClient();

  const approvalQuery = supabase
    .from("approval_decisions")
    .update({
      status: "approved",
      reviewer_name: reviewer,
      reviewed_at: new Date().toISOString(),
      note: note ?? null,
    })
    .eq("task_id", id);

  const { error: approvalError } = channel ? await approvalQuery.eq("channel", channel) : await approvalQuery;
  assertNoError(approvalError);

  const { data: approvals, error: approvalsError } = await supabase.from("approval_decisions").select("status").eq("task_id", id);
  assertNoError(approvalsError);
  const pending = ((approvals as Array<{ status: ApprovalDecision["status"] }>) ?? []).some((entry) => entry.status === "pending");

  const { data: task, error: taskError } = await supabase
    .from("publication_tasks")
    .update({
      status: pending ? "needs_approval" : "approved",
      last_run_stage: "approval",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (taskError?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(taskError);

  const { error: eventError } = await supabase.from("execution_events").insert({
    task_id: id,
    stage: "approve",
    status: pending ? "needs_approval" : "ok",
    message: pending ? "Partial approval recorded." : "All required approvals were completed.",
    latency_ms: 55,
    estimated_cost_usd: 0,
  });

  assertNoError(eventError);

  return mapTask(task as TaskRow);
}

export async function rejectPublication(id: string, reviewer: string, note?: string, channel?: Channel) {
  if (!hasSupabaseServerConfig()) {
    return rejectDemoPublication(id, reviewer, note, channel);
  }

  const supabase = getSupabaseServerClient();

  const rejectionQuery = supabase
    .from("approval_decisions")
    .update({
      status: "rejected",
      reviewer_name: reviewer,
      reviewed_at: new Date().toISOString(),
      note: note ?? null,
    })
    .eq("task_id", id);

  const { error: rejectionError } = channel ? await rejectionQuery.eq("channel", channel) : await rejectionQuery;
  assertNoError(rejectionError);

  const { data: task, error: taskError } = await supabase
    .from("publication_tasks")
    .update({
      status: "draft",
      last_run_stage: "revision",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (taskError?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(taskError);

  const { error: eventError } = await supabase.from("execution_events").insert({
    task_id: id,
    stage: "reject",
    status: "ok",
    message: note ?? `Revision requested by ${reviewer}.`,
    latency_ms: 60,
    estimated_cost_usd: 0,
  });

  assertNoError(eventError);

  return mapTask(task as TaskRow);
}

export async function retryPublication(id: string) {
  if (!hasSupabaseServerConfig()) {
    return retryDemoPublication(id);
  }

  const supabase = getSupabaseServerClient();

  const [{ data: task, error: taskError }, { data: assets, error: assetError }, { data: drafts, error: draftError }] = await Promise.all([
    supabase.from("publication_tasks").select("*").eq("id", id).single(),
    supabase.from("source_assets").select("*").eq("task_id", id).order("canonical_date", { ascending: false }).limit(1),
    supabase.from("channel_drafts").select("*").eq("task_id", id).order("approved_revision", { ascending: false }).limit(1),
  ]);

  if (taskError?.message?.includes("0 rows")) {
    return null;
  }

  assertNoError(taskError);
  assertNoError(assetError);
  assertNoError(draftError);

  const currentTask = task as TaskRow;
  const asset = (assets as SourceAssetRow[])[0];
  const draft = (drafts as ChannelDraftRow[])[0];

  const { data: updatedTask, error: updateError } = await supabase
    .from("publication_tasks")
    .update({
      status: "processing",
      last_run_stage: "retry",
      retry_count: currentTask.retry_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  assertNoError(updateError);

  if (asset && draft) {
    const accountId = `${draft.channel}-main`;
    const idempotencyKey = buildPublishIdempotencyKey({
      normalizedUrl: asset.normalized_url,
      canonicalDate: asset.canonical_date,
      channel: draft.channel,
      accountId,
      approvedRevision: draft.approved_revision,
    });

    const { data: existingAttempt, error: existingError } = await supabase
      .from("publish_attempts")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    assertNoError(existingError);

    if (existingAttempt) {
      const { error } = await supabase
        .from("publish_attempts")
        .update({
          status: "queued",
          last_error: null,
        })
        .eq("id", existingAttempt.id);
      assertNoError(error);
    } else {
      const { error } = await supabase.from("publish_attempts").insert({
        task_id: id,
        channel: draft.channel,
        account_id: accountId,
        idempotency_key: idempotencyKey,
        status: "queued",
      });
      assertNoError(error);
    }
  }

  const { error: eventError } = await supabase.from("execution_events").insert({
    task_id: id,
    stage: "retry",
    status: "retryable_error",
    message: "Reintento manual encolado conservando la misma llave de idempotencia.",
    latency_ms: 70,
    estimated_cost_usd: 0,
  });

  assertNoError(eventError);

  return mapTask(updatedTask as TaskRow);
}

export async function listDrafts(taskId: string) {
  if (!hasSupabaseServerConfig()) {
    return listDemoDrafts(taskId);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("channel_drafts").select("*").eq("task_id", taskId).order("channel", { ascending: true });
  assertNoError(error);
  return ((data as ChannelDraftRow[]) ?? []).map(mapDraft);
}

export async function listApprovals(taskId: string) {
  if (!hasSupabaseServerConfig()) {
    return listDemoApprovals(taskId);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("approval_decisions").select("*").eq("task_id", taskId);
  assertNoError(error);
  return ((data as ApprovalDecisionRow[]) ?? []).map(mapApproval);
}


