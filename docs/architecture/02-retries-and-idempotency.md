# Retries and idempotency

## Base rule
- A publish intent is not repeated if it keeps the same combination `normalizedUrl + canonicalDate + channel + accountId + approvedRevision`.

## Strategy
- `retryable_error`: exponential retry from n8n and manual retry from the UI are allowed.
- `fatal_error`: the task is frozen until human intervention.
- Every retry keeps the `correlationId` and appends a trace to `ExecutionEvent`.

## Circuit breaker
- External APIs with sustained failures switch to a degraded state.
- `publish-channel` does not attempt to publish on a degraded integration; it sends `notify-ops` and leaves the state visible.
