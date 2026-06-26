# Sandbox operations runbook

## Incident: access failure
1. Confirm the sandbox user has the role expected for its email.
2. Verify the redirect to `/login` or a `401/403` response from the API.
3. Repeat with `editor`, `approver` and `admin` to confirm enforcement.

## Incident: extraction or persistence failure
1. Review `execution_events` by `correlationId`.
2. Confirm the Supabase sandbox is provisioned and has the `schema` applied.
3. If the source is unsafe or the sandbox does not respond, block `WF-011` and record evidence.

## Incident: partial publication or retry
1. Review `publish_attempts` per channel.
2. Confirm per-channel approval.
3. Retry only the failed channel while keeping the `idempotencyKey`.

## Incident: compromised credential
1. Rotate the affected sandbox provider.
2. Re-inject credentials through a secure channel.
3. Keep the project blocked until access and permissions are revalidated.
