import { buildPublishIdempotencyKey } from "@/lib/publishing/idempotency";
import type { ApprovalDecision, Channel, ChannelDraft, PublicationStatus, PublishAttempt } from "@/lib/types";

// Retrying republishes a task, so it is allowed only for a task that failed, fully or in part, and
// at most MAX_PUBLICATION_RETRIES times. Shared by both stores (in-memory and Supabase) and by the
// publication page, which disables the Retry button with the same reason the API would give.
export const MAX_PUBLICATION_RETRIES = 3;

export const RETRYABLE_STATUSES = ["failed", "partially_published"] as const satisfies readonly PublicationStatus[];

export const NOTHING_TO_RETRY = "Nothing to retry: no approved channel is waiting to be published again.";

// Why a retry is refused by the task's own state, or null when the state allows one.
export function retryRefusal(status: PublicationStatus, retries: number): string | null {
  if (!(RETRYABLE_STATUSES as readonly PublicationStatus[]).includes(status)) {
    return "Only failed or partially published publications can be retried.";
  }

  if (retries >= MAX_PUBLICATION_RETRIES) {
    return `This publication already used its ${MAX_PUBLICATION_RETRIES} retries.`;
  }

  return null;
}

// A published attempt is final and a queued one is already waiting. Only a failed or draft attempt
// goes back to the queue.
export const REQUEUEABLE_ATTEMPT_STATUSES = ["failed", "draft"] as const satisfies readonly PublishAttempt["status"][];

export function shouldRequeueAttempt(status: PublishAttempt["status"]): boolean {
  return (REQUEUEABLE_ATTEMPT_STATUSES as readonly PublishAttempt["status"][]).includes(status);
}

export interface RetryTarget {
  channel: Channel;
  accountId: string;
  idempotencyKey: string;
}

export interface RetryContext {
  asset: { normalizedUrl: string; canonicalDate: string } | null;
  drafts: Pick<ChannelDraft, "channel" | "approvedRevision" | "requiresApproval">[];
  approvals: Pick<ApprovalDecision, "channel" | "status">[];
}

type RetryDraft = RetryContext["drafts"][number];

// What a retry may publish: for each channel, its current draft (the highest approved revision), and
// only if the editorial gate lets it through:
// - a channel with approval rows needs every one of them "approved": one pending or rejected row
//   blocks it, so a stray extra row can never open the gate;
// - a channel without approval rows passes only if its draft does not require approval. The app
//   opens reviews for the direct channels (LinkedIn, Facebook, Instagram) only, so this is how an X
//   or Threads draft that skips review can be retried. requires_approval defaults to true.
// A superseded revision is never published by a retry: that would post old content.
export function retryTargets({ asset, drafts, approvals }: RetryContext): RetryTarget[] {
  if (!asset) return [];
  const reviews = new Map<Channel, ApprovalDecision["status"][]>();
  for (const approval of approvals) {
    reviews.set(approval.channel, [...(reviews.get(approval.channel) ?? []), approval.status]);
  }
  const passesGate = (draft: RetryDraft) => {
    const statuses = reviews.get(draft.channel);
    return statuses ? statuses.every((status) => status === "approved") : !draft.requiresApproval;
  };
  const current = new Map<Channel, RetryDraft>();
  for (const draft of drafts) {
    const seen = current.get(draft.channel);
    if (!seen || draft.approvedRevision > seen.approvedRevision) current.set(draft.channel, draft);
  }
  return [...current.values()].filter(passesGate).map(({ channel, approvedRevision }) => ({
    channel,
    accountId: `${channel}-main`,
    idempotencyKey: buildPublishIdempotencyKey({
      normalizedUrl: asset.normalizedUrl,
      canonicalDate: asset.canonicalDate,
      channel,
      accountId: `${channel}-main`,
      approvedRevision,
    }),
  }));
}

export interface RetryAttempt {
  id: string;
  status: PublishAttempt["status"];
  idempotencyKey: string;
}

export interface RetryPlan {
  requeueIds: string[];
  newAttempts: RetryTarget[];
}

// What a retry does, decided before anything is written: queue again the failed or draft attempts
// of the current targets, and create the targets that never had an attempt. Attempts of superseded
// revisions are left alone. null means there is nothing to retry: the caller answers 409 and the
// task is not changed.
export function planRetry(attempts: RetryAttempt[], targets: RetryTarget[]): RetryPlan | null {
  const targetKeys = new Set(targets.map((target) => target.idempotencyKey));
  const requeueIds = attempts
    .filter((attempt) => targetKeys.has(attempt.idempotencyKey) && shouldRequeueAttempt(attempt.status))
    .map((attempt) => attempt.id);
  const attemptedKeys = new Set(attempts.map((attempt) => attempt.idempotencyKey));
  const newAttempts = targets.filter((target) => !attemptedKeys.has(target.idempotencyKey));
  return requeueIds.length > 0 || newAttempts.length > 0 ? { requeueIds, newAttempts } : null;
}

// The event text, from what was actually written.
export function retryEventMessage(requeued: number, created: number): string {
  return `Manual retry queued ${requeued} existing attempt(s) again and ${created} new one(s), keeping their idempotency keys.`;
}

// Why the Retry button is off for this publication, from the same rules the API applies.
export function retryBlockedReason(publication: {
  status: PublicationStatus;
  metrics: { retries: number };
  sourceAsset: RetryContext["asset"];
  drafts: RetryContext["drafts"];
  approvals: RetryContext["approvals"];
  attempts: RetryAttempt[];
}): string | null {
  const refusal = retryRefusal(publication.status, publication.metrics.retries);
  if (refusal) return refusal;
  return planRetry(publication.attempts, retryTargets({ asset: publication.sourceAsset, drafts: publication.drafts, approvals: publication.approvals }))
    ? null
    : NOTHING_TO_RETRY;
}
