# Sandbox operations checklist

## Before validating
- Sandbox credentials loaded per environment without exposing values.
- `supabase/schema.sql` applied.
- `supabase/seed.sql` applied.
- Sandbox login working for `editor`, `approver` and `admin`.

## Local smoke test
- Create a task from the UI.
- Request approval.
- Approve or reject.
- Retry a publication while keeping the `idempotencyKey`.
- View the timeline and metrics in dashboard/history/observability.

## Closing this phase
- Record the `WF-011` result.
- Record the local functional pass.
- Run `audit` and `vuln` only once the sandbox already responds.
