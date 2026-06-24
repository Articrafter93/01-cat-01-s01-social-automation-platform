import { z } from "zod";

const safeUrlRefinement = (value: string) => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const channelSchema = z.enum(["linkedin", "facebook", "instagram", "x", "threads"]);
export const sourceTypeSchema = z.enum(["article", "youtube"]);
export const publicationStatusSchema = z.enum([
  "draft",
  "processing",
  "needs_approval",
  "approved",
  "publishing",
  "partially_published",
  "published",
  "failed",
]);
export const executionStatusSchema = z.enum(["ok", "needs_approval", "retryable_error", "fatal_error", "skipped"]);
export const userRoleSchema = z.enum(["admin", "editor", "approver"]);

export const workflowEnvelopeSchema = z.object({
  correlationId: z.string().min(1),
  taskId: z.string().min(1),
  stage: z.string().min(1),
  idempotencyKey: z.string().min(1),
  trace: z.array(z.string()),
  inputVersion: z.string().min(1),
  payload: z.unknown(),
  attempt: z.number().int().min(1),
  requestedChannels: z.array(channelSchema).min(1),
});

export const workflowResultSchema = z.object({
  status: executionStatusSchema,
  payload: z.unknown(),
  metrics: z.object({
    durationMs: z.number().nonnegative(),
    estimatedCostUsd: z.number().nonnegative().optional(),
    retries: z.number().int().nonnegative().optional(),
  }),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      retriable: z.boolean(),
      context: z.record(z.string()).optional(),
    })
    .optional(),
});

export const publicationCreateSchema = z.object({
  sourceUrl: z.string().url().refine(safeUrlRefinement, "URL protocol must be HTTP or HTTPS"),
  sourceType: sourceTypeSchema,
  brand: z.string().min(2).max(80),
  locale: z.string().min(2).max(10),
  tone: z.string().min(2).max(80),
  useAiImage: z.boolean(),
  requestedChannels: z.array(channelSchema).min(1),
});

// `reviewer` is intentionally NOT accepted from the client: the reviewer
// identity is derived server-side from the authenticated session to keep the
// approval audit trail unforgeable.
export const approvalActionSchema = z.object({
  channel: channelSchema.optional(),
  note: z.string().max(500).optional(),
});

export const promptTemplateUpdateSchema = z.object({
  status: z.enum(["draft", "active"]).optional(),
  template: z.string().min(20).optional(),
  locale: z.string().min(2).max(10).optional(),
});
