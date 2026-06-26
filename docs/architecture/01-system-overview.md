# Social Automation Platform

## Architecture
- `Next.js 15 + Prisma + PostgreSQL` acts as the product, RBAC, approvals, auditing and source of truth.
- `n8n` runs decoupled subworkflows and only reports events/states to the signed internal API.
- `Redis` backs `queue mode` for retries and execution decoupling.

## Main components
- `Operational API`: creates tasks, manages states, approvals, retries and integrations.
- `Editorial UI`: dashboard, new publication, approvals, history, observability and settings.
- `Workflow layer`: parent workflow and per-stage subworkflows with fixed JSON contracts.
- `Security layer`: external secret storage, scraping allowlist, webhook signing, audit trail.

## Source of truth
- Core tables: `PublicationTask`, `SourceAsset`, `ChannelDraft`, `ApprovalDecision`, `PublishAttempt`, `ExecutionEvent`, `IntegrationBinding`, `PromptTemplate`.
- Google Sheets is out of the operational loop. Only a backlog import is accepted, as a controlled migration.
