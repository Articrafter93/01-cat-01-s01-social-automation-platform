export type Channel = "linkedin" | "facebook" | "instagram" | "x" | "threads";
export type SourceType = "article" | "youtube";
export type PublicationStatus =
  | "draft"
  | "processing"
  | "needs_approval"
  | "approved"
  | "publishing"
  | "partially_published"
  | "published"
  | "failed";
export type ExecutionStatus = "ok" | "needs_approval" | "retryable_error" | "fatal_error" | "skipped";
export type UserRole = "admin" | "editor" | "approver";

export interface WorkflowEnvelope<TPayload = unknown> {
  correlationId: string;
  taskId: string;
  stage: string;
  idempotencyKey: string;
  trace: string[];
  inputVersion: string;
  payload: TPayload;
  attempt: number;
  requestedChannels: Channel[];
}

export interface WorkflowResult<TPayload = unknown> {
  status: ExecutionStatus;
  payload: TPayload;
  metrics: {
    durationMs: number;
    estimatedCostUsd?: number;
    retries?: number;
  };
  error?: {
    code: string;
    message: string;
    retriable: boolean;
    context?: Record<string, string>;
  };
}

export interface SourceAsset {
  id: string;
  taskId: string;
  sourceType: SourceType;
  normalizedUrl: string;
  canonicalDate: string;
  title: string;
  author?: string;
  summary?: string;
  transcriptStatus: "available" | "missing" | "not_required";
  extractionStatus: ExecutionStatus;
}

export interface ChannelDraft {
  id: string;
  taskId: string;
  channel: Channel;
  headline: string;
  body: string;
  characterCount: number;
  requiresApproval: boolean;
  approvedRevision: number;
  validationWarnings: string[];
  imagePrompt?: string;
}

export interface ApprovalDecision {
  id: string;
  taskId: string;
  channel: Channel;
  status: "pending" | "approved" | "rejected";
  reviewer: string;
  reviewedAt?: string;
  note?: string;
}

export interface PublishAttempt {
  id: string;
  taskId: string;
  channel: Channel;
  accountId: string;
  idempotencyKey: string;
  status: "draft" | "queued" | "published" | "failed";
  publishedAt?: string;
  externalPostId?: string;
  lastError?: string;
}

export interface ExecutionEvent {
  id: string;
  taskId: string;
  stage: string;
  status: ExecutionStatus;
  message: string;
  createdAt: string;
  latencyMs: number;
  estimatedCostUsd: number;
}

export interface IntegrationBinding {
  id: string;
  provider: string;
  environment: "dev" | "staging" | "prod";
  status: "healthy" | "warning" | "disconnected";
  scopes: string[];
  lastRotatedAt: string;
}

export interface PromptTemplate {
  id: string;
  brand: string;
  channel: Channel | "base";
  locale: string;
  contentType: "article" | "youtube" | "campaign";
  version: number;
  status: "draft" | "active";
  template: string;
}

export interface PublicationTask {
  id: string;
  correlationId: string;
  sourceUrl: string;
  normalizedUrl: string;
  sourceType: SourceType;
  title: string;
  status: PublicationStatus;
  brand: string;
  locale: string;
  tone: string;
  useAiImage: boolean;
  requestedChannels: Channel[];
  createdAt: string;
  updatedAt: string;
  lastRunStage: string;
  metrics: {
    totalEstimatedCostUsd: number;
    totalLatencyMs: number;
    retries: number;
  };
}

export interface DashboardMetrics {
  processed: number;
  pending: number;
  approved: number;
  published: number;
  failed: number;
  failureRate: number;
}
