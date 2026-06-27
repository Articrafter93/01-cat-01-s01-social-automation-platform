import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";
import type {
  ApprovalDecision,
  Channel,
  ChannelDraft,
  ExecutionEvent,
  IntegrationBinding,
  PromptTemplate,
  PublicationTask,
  SourceType,
} from "@/lib/types";
import {
  approvals,
  channelDrafts,
  computeDashboardMetrics,
  executionEvents,
  integrationBindings,
  promptTemplates,
  publicationTasks,
  publishAttempts,
  sourceAssets,
} from "@/server/repositories/in-memory-store";
import { loadState, saveState } from "@/server/repositories/persistence";

const directChannels: Channel[] = ["linkedin", "facebook", "instagram"];

type CreatePublicationInput = {
  sourceUrl: string;
  sourceType: SourceType;
  brand: string;
  locale: string;
  tone: string;
  useAiImage: boolean;
  requestedChannels: Channel[];
};

type PromptUpdateInput = {
  status?: "draft" | "active";
  template?: string;
  locale?: string;
};

function buildId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function touchTask(task: PublicationTask, patch: Partial<PublicationTask>) {
  Object.assign(task, patch, { updatedAt: new Date().toISOString() });
  return task;
}

function addEvent(event: Omit<ExecutionEvent, "id" | "createdAt">) {
  executionEvents.unshift({
    id: buildId("event"),
    createdAt: new Date().toISOString(),
    ...event,
  });
}

function findTask(id: string) {
  return publicationTasks.find((task) => task.id === id) ?? null;
}

function withTaskRelations(task: PublicationTask) {
  return {
    ...task,
    drafts: channelDrafts.filter((draft) => draft.taskId === task.id),
    approvals: approvals.filter((approval) => approval.taskId === task.id),
  };
}

export async function listDemoPublications() {
  await loadState();
  return [...publicationTasks]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(withTaskRelations);
}

export async function getDemoPublicationById(id: string) {
  await loadState();
  const task = findTask(id);
  if (!task) {
    return null;
  }

  return {
    ...task,
    sourceAsset:
      sourceAssets
        .filter((asset) => asset.taskId === id)
        .sort((a, b) => b.canonicalDate.localeCompare(a.canonicalDate))[0] ?? null,
    drafts: channelDrafts.filter((draft) => draft.taskId === id).sort((a, b) => a.channel.localeCompare(b.channel)),
    approvals: approvals.filter((approval) => approval.taskId === id),
    attempts: publishAttempts.filter((attempt) => attempt.taskId === id),
    events: executionEvents
      .filter((event) => event.taskId === id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}

export async function createDemoPublication(input: CreatePublicationInput, normalizedUrl: string) {
  await loadState();
  const timestamp = new Date().toISOString();
  const task: PublicationTask = {
    id: buildId("task"),
    correlationId: buildId("corr"),
    sourceUrl: input.sourceUrl,
    normalizedUrl,
    sourceType: input.sourceType,
    title: "Pending source extraction",
    status: "draft",
    brand: input.brand,
    locale: input.locale,
    tone: input.tone,
    useAiImage: input.useAiImage,
    requestedChannels: input.requestedChannels,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastRunStage: "ingest",
    metrics: {
      totalEstimatedCostUsd: 0,
      totalLatencyMs: 0,
      retries: 0,
    },
  };

  publicationTasks.unshift(task);

  input.requestedChannels
    .filter((channel) => directChannels.includes(channel))
    .forEach((channel) => {
      approvals.push({
        id: buildId("approval"),
        taskId: task.id,
        channel,
        status: "pending",
        reviewer: "Pending",
      });
    });

  addEvent({
    taskId: task.id,
    stage: "ingest",
    status: "ok",
    message: "Task created from the local panel and sent to orchestration.",
    latencyMs: 30,
    estimatedCostUsd: 0,
  });

  await saveState();
  return task;
}

export async function requestDemoApproval(id: string, reviewer: string, note?: string) {
  await loadState();
  const task = findTask(id);
  if (!task) {
    return null;
  }

  touchTask(task, {
    status: "needs_approval",
    lastRunStage: "editorial-gate",
  });

  addEvent({
    taskId: id,
    stage: "request-approval",
    status: "needs_approval",
    message: note ?? `Approval requested by ${reviewer}.`,
    latencyMs: 42,
    estimatedCostUsd: 0,
  });

  await saveState();
  return task;
}

export async function approveDemoPublication(id: string, reviewer: string, note?: string, channel?: Channel) {
  await loadState();
  const task = findTask(id);
  if (!task) {
    return null;
  }

  approvals
    .filter((approval) => approval.taskId === id && (!channel || approval.channel === channel))
    .forEach((approval) => {
      approval.status = "approved";
      approval.reviewer = reviewer;
      approval.reviewedAt = new Date().toISOString();
      approval.note = note;
    });

  const pending = approvals.some((approval) => approval.taskId === id && approval.status === "pending");
  touchTask(task, {
    status: pending ? "needs_approval" : "approved",
    lastRunStage: "approval",
  });

  addEvent({
    taskId: id,
    stage: "approve",
    status: pending ? "needs_approval" : "ok",
    message: pending ? "Partial approval recorded." : "All required approvals were completed.",
    latencyMs: 55,
    estimatedCostUsd: 0,
  });

  await saveState();
  return task;
}

export async function rejectDemoPublication(id: string, reviewer: string, note?: string, channel?: Channel) {
  await loadState();
  const task = findTask(id);
  if (!task) {
    return null;
  }

  approvals
    .filter((approval) => approval.taskId === id && (!channel || approval.channel === channel))
    .forEach((approval) => {
      approval.status = "rejected";
      approval.reviewer = reviewer;
      approval.reviewedAt = new Date().toISOString();
      approval.note = note;
    });

  touchTask(task, {
    status: "draft",
    lastRunStage: "revision",
  });

  addEvent({
    taskId: id,
    stage: "reject",
    status: "ok",
    message: note ?? `Revision requested by ${reviewer}.`,
    latencyMs: 60,
    estimatedCostUsd: 0,
  });

  await saveState();
  return task;
}

export async function retryDemoPublication(id: string) {
  await loadState();
  const task = findTask(id);
  if (!task) {
    return null;
  }

  touchTask(task, {
    status: "processing",
    lastRunStage: "retry",
    metrics: {
      ...task.metrics,
      retries: task.metrics.retries + 1,
    },
  });

  const asset = sourceAssets
    .filter((entry) => entry.taskId === id)
    .sort((a, b) => b.canonicalDate.localeCompare(a.canonicalDate))[0];
  const draft = channelDrafts
    .filter((entry) => entry.taskId === id)
    .sort((a, b) => b.approvedRevision - a.approvedRevision)[0];

  if (asset && draft) {
    const accountId = `${draft.channel}-main`;
    const idempotencyKey = buildPublishIdempotencyKey({
      normalizedUrl: asset.normalizedUrl,
      canonicalDate: asset.canonicalDate,
      channel: draft.channel,
      accountId,
      approvedRevision: draft.approvedRevision,
    });
    const existingAttempt = publishAttempts.find((attempt) => attempt.idempotencyKey === idempotencyKey);

    if (existingAttempt) {
      existingAttempt.status = "queued";
      existingAttempt.lastError = undefined;
    } else {
      publishAttempts.push({
        id: buildId("publish"),
        taskId: id,
        channel: draft.channel,
        accountId,
        idempotencyKey,
        status: "queued",
      });
    }
  }

  addEvent({
    taskId: id,
    stage: "retry",
    status: "retryable_error",
    message: "Manual retry queued, preserving the same idempotency key.",
    latencyMs: 70,
    estimatedCostUsd: 0,
  });

  await saveState();
  return task;
}

export async function listDemoDrafts(taskId: string): Promise<ChannelDraft[]> {
  await loadState();
  return channelDrafts.filter((draft) => draft.taskId === taskId).sort((a, b) => a.channel.localeCompare(b.channel));
}

export async function listDemoApprovals(taskId: string): Promise<ApprovalDecision[]> {
  await loadState();
  return approvals.filter((approval) => approval.taskId === taskId);
}

export async function listDemoExecutions() {
  await loadState();
  return [...executionEvents].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getDemoDashboardData() {
  await loadState();
  const tasksByStatus = publicationTasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

  const recentEvents = [...executionEvents]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 6);

  return {
    metrics: computeDashboardMetrics(),
    tasksByStatus,
    recentEvents,
  };
}

export async function listDemoPrompts(): Promise<PromptTemplate[]> {
  await loadState();
  return [...promptTemplates].sort((a, b) => `${a.brand}:${a.channel}:${b.version}`.localeCompare(`${b.brand}:${b.channel}:${a.version}`));
}

export async function updateDemoPrompt(id: string, input: PromptUpdateInput) {
  await loadState();
  const prompt = promptTemplates.find((entry) => entry.id === id);
  if (!prompt) {
    return null;
  }

  if (input.status) {
    prompt.status = input.status;
  }

  if (input.template) {
    prompt.template = input.template;
  }

  if (input.locale) {
    prompt.locale = input.locale;
  }

  await saveState();
  return prompt;
}

export async function listDemoIntegrations(): Promise<IntegrationBinding[]> {
  await loadState();
  return [...integrationBindings].sort((a, b) => a.provider.localeCompare(b.provider));
}
