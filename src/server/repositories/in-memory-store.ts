import type {
  ApprovalDecision,
  ChannelDraft,
  DashboardMetrics,
  ExecutionEvent,
  IntegrationBinding,
  PromptTemplate,
  PublicationTask,
  PublishAttempt,
  SourceAsset,
} from "@/lib/types";
import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";

/**
 * In-memory demo store, pinned to globalThis.
 *
 * The collections below are mutated in place by the demo repository (approve,
 * reject, retry, create…). In the Next.js App Router a plain module-level
 * `export const` is NOT a reliable singleton: route handlers, RSC pages and
 * dev-mode HMR can each evaluate their own copy of the module, so a mutation
 * applied through the API route would be invisible to a page that re-read a
 * freshly-seeded copy (e.g. approve a task, yet History still shows it pending).
 * Pinning the seeded collections to `globalThis` gives every module instance the
 * same references and survives HMR, so demo state stays consistent across views.
 */
type Store = {
  publicationTasks: PublicationTask[];
  sourceAssets: SourceAsset[];
  channelDrafts: ChannelDraft[];
  approvals: ApprovalDecision[];
  publishAttempts: PublishAttempt[];
  executionEvents: ExecutionEvent[];
  promptTemplates: PromptTemplate[];
  integrationBindings: IntegrationBinding[];
};

function seedStore(): Store {
  const now = new Date();

  const publicationTasks: PublicationTask[] = [
    {
      id: "task_001",
      correlationId: "corr_20260409_001",
      sourceUrl: "https://example.com/insights/enterprise-social-ai",
      normalizedUrl: "https://example.com/insights/enterprise-social-ai",
      sourceType: "article",
      title: "How enterprise editorial teams can automate social publishing safely",
      status: "needs_approval",
      brand: "Antigravity",
      locale: "en-US",
      tone: "Clear executive",
      useAiImage: true,
      requestedChannels: ["linkedin", "facebook", "instagram", "x"],
      createdAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 8).toISOString(),
      lastRunStage: "generate-social-copy",
      metrics: {
        totalEstimatedCostUsd: 3.42,
        totalLatencyMs: 12840,
        retries: 1,
      },
    },
    {
      id: "task_002",
      correlationId: "corr_20260409_002",
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
      normalizedUrl: "https://www.youtube.com/watch?v=abc123",
      sourceType: "youtube",
      title: "Automation governance for multi-channel marketing",
      status: "published",
      brand: "Antigravity",
      locale: "en-US",
      tone: "Analytical premium",
      useAiImage: false,
      requestedChannels: ["linkedin", "facebook", "instagram"],
      createdAt: new Date(now.getTime() - 1000 * 60 * 480).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      lastRunStage: "publish-channel",
      metrics: {
        totalEstimatedCostUsd: 2.11,
        totalLatencyMs: 18990,
        retries: 0,
      },
    },
  ];

  const sourceAssets: SourceAsset[] = [
    {
      id: "asset_001",
      taskId: "task_001",
      sourceType: "article",
      normalizedUrl: "https://example.com/insights/enterprise-social-ai",
      canonicalDate: "2026-04-09",
      title: "How enterprise editorial teams can automate social publishing safely",
      author: "Editorial Ops Weekly",
      summary: "A framework for editorial automation with approvals, observability and idempotent publishing.",
      transcriptStatus: "not_required",
      extractionStatus: "ok",
    },
    {
      id: "asset_002",
      taskId: "task_002",
      sourceType: "youtube",
      normalizedUrl: "https://www.youtube.com/watch?v=abc123",
      canonicalDate: "2026-04-08",
      title: "Automation governance for multi-channel marketing",
      transcriptStatus: "available",
      extractionStatus: "ok",
    },
  ];

  const channelDrafts: ChannelDraft[] = [
    {
      id: "draft_001",
      taskId: "task_001",
      channel: "linkedin",
      headline: "Automating social shouldn't feel like operational roulette",
      body: "We turn a scraping + AI + publishing chain into a traceable system, with approval and real per-channel controls.",
      characterCount: 138,
      requiresApproval: true,
      approvedRevision: 2,
      validationWarnings: [],
      imagePrompt: "Editorial control room with teal accents and premium publishing dashboard.",
    },
    {
      id: "draft_002",
      taskId: "task_001",
      channel: "facebook",
      headline: "From a fragile flow to a reliable operation",
      body: "The point isn't to publish more, but to publish with control, evidence and zero duplicates across channels.",
      characterCount: 104,
      requiresApproval: true,
      approvedRevision: 2,
      validationWarnings: ["Confirm final CTA for Facebook."],
    },
    {
      id: "draft_003",
      taskId: "task_001",
      channel: "instagram",
      headline: "A serious editorial system",
      body: "Modular automation, upfront approval and real observability for every publication.",
      characterCount: 92,
      requiresApproval: true,
      approvedRevision: 1,
      validationWarnings: ["Add extended caption and curated hashtags."],
    },
  ];

  const approvals: ApprovalDecision[] = [
    {
      id: "approval_001",
      taskId: "task_001",
      channel: "linkedin",
      status: "approved",
      reviewer: "Laura Ops",
      reviewedAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: "approval_002",
      taskId: "task_001",
      channel: "facebook",
      status: "pending",
      reviewer: "Pending",
    },
    {
      id: "approval_003",
      taskId: "task_001",
      channel: "instagram",
      status: "pending",
      reviewer: "Pending",
    },
  ];

  const publishAttempts: PublishAttempt[] = [
    {
      id: "publish_001",
      taskId: "task_002",
      channel: "linkedin",
      accountId: "linkedin-main",
      idempotencyKey: buildPublishIdempotencyKey({
        normalizedUrl: "https://www.youtube.com/watch?v=abc123",
        canonicalDate: "2026-04-08",
        channel: "linkedin",
        accountId: "linkedin-main",
        approvedRevision: 1,
      }),
      status: "published",
      publishedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      externalPostId: "li_778899",
    },
    {
      id: "publish_002",
      taskId: "task_001",
      channel: "facebook",
      accountId: "facebook-main",
      idempotencyKey: buildPublishIdempotencyKey({
        normalizedUrl: "https://example.com/insights/enterprise-social-ai",
        canonicalDate: "2026-04-09",
        channel: "facebook",
        accountId: "facebook-main",
        approvedRevision: 2,
      }),
      status: "draft",
    },
  ];

  const executionEvents: ExecutionEvent[] = [
    {
      id: "event_001",
      taskId: "task_001",
      stage: "fetch-source",
      status: "ok",
      message: "Source fetched and validated against the scrape allowlist.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      latencyMs: 741,
      estimatedCostUsd: 0,
    },
    {
      id: "event_002",
      taskId: "task_001",
      stage: "extract-article",
      status: "ok",
      message: "Readable article extracted with sanitizer and HTML parser.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 28).toISOString(),
      latencyMs: 1244,
      estimatedCostUsd: 0.02,
    },
    {
      id: "event_003",
      taskId: "task_001",
      stage: "generate-social-copy",
      status: "needs_approval",
      message: "Drafts generated for 4 channels; editorial gate raised for direct channels.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 9).toISOString(),
      latencyMs: 4020,
      estimatedCostUsd: 1.91,
    },
    {
      id: "event_004",
      taskId: "task_002",
      stage: "publish-channel",
      status: "ok",
      message: "LinkedIn, Facebook and Instagram published successfully.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      latencyMs: 5320,
      estimatedCostUsd: 0.18,
    },
  ];

  const promptTemplates: PromptTemplate[] = [
    {
      id: "prompt_001",
      brand: "Antigravity",
      channel: "base",
      locale: "en-US",
      contentType: "article",
      version: 4,
      status: "active",
      template: "Summarize the source in an executive tone, keep verifiable facts and return typed JSON with editorial angle and risks.",
    },
    {
      id: "prompt_002",
      brand: "Antigravity",
      channel: "linkedin",
      locale: "en-US",
      contentType: "article",
      version: 3,
      status: "active",
      template: "Generate LinkedIn copy with a strong opening, enterprise clarity, no hype or unverifiable claims.",
    },
  ];

  const integrationBindings: IntegrationBinding[] = [
    {
      id: "binding_001",
      provider: "openai",
      environment: "prod",
      status: "healthy",
      scopes: ["generation", "summaries"],
      lastRotatedAt: "2026-04-09T15:00:00.000Z",
    },
    {
      id: "binding_002",
      provider: "fal",
      environment: "prod",
      status: "warning",
      scopes: ["image-generation"],
      lastRotatedAt: "2026-04-09T14:40:00.000Z",
    },
    {
      id: "binding_003",
      provider: "linkedin",
      environment: "prod",
      status: "healthy",
      scopes: ["publish"],
      lastRotatedAt: "2026-04-09T14:10:00.000Z",
    },
  ];

  return {
    publicationTasks,
    sourceAssets,
    channelDrafts,
    approvals,
    publishAttempts,
    executionEvents,
    promptTemplates,
    integrationBindings,
  };
}

const globalForStore = globalThis as unknown as { __socialAutomationStore?: Store };
const store = (globalForStore.__socialAutomationStore ??= seedStore());

export const publicationTasks = store.publicationTasks;
export const sourceAssets = store.sourceAssets;
export const channelDrafts = store.channelDrafts;
export const approvals = store.approvals;
export const publishAttempts = store.publishAttempts;
export const executionEvents = store.executionEvents;
export const promptTemplates = store.promptTemplates;
export const integrationBindings = store.integrationBindings;

export function computeDashboardMetrics(): DashboardMetrics {
  const processed = publicationTasks.length;
  const pending = publicationTasks.filter((task) => ["draft", "processing", "needs_approval"].includes(task.status)).length;
  const approved = publicationTasks.filter((task) => task.status === "approved").length;
  const published = publicationTasks.filter((task) => task.status === "published").length;
  const failed = publicationTasks.filter((task) => task.status === "failed").length;

  return {
    processed,
    pending,
    approved,
    published,
    failed,
    failureRate: processed === 0 ? 0 : failed / processed,
  };
}
