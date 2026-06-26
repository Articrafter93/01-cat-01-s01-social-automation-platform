# Social Automation Platform

An internal editorial orchestration system that manages the full lifecycle of a publication: from draft creation through approval, execution and event traceability. Built for content teams that need role-based access control, an auditable history and idempotency on publishing retries.

## The problem it solves

Content teams operating across multiple channels (social networks, newsletters, blogs) need a centralized control point before running external publications. Without it, you get duplicates, lost approvals and no traceability of who did what and when.

This platform acts as the editorial orchestration layer: it receives the tasks, applies the approval flow and records every state transition before delegating execution to the external engine. In this demo, the execution layer is simulated in memory; in production it would connect to n8n (or another orchestrator) via webhook.

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Server Actions + RSC remove an unnecessary API layer for this domain |
| Auth + sessions | Auth.js v5 | Native Next.js integration; extensible to OAuth providers |
| Database | Supabase (PostgreSQL) | Per-schema RLS, project pooling and automated keep-alive |
| Orchestration | n8n (interface defined) | Separation between the editorial logic (this app) and external execution; in the demo the execution layer runs in memory |
| Styling | Tailwind CSS + shadcn/ui | A coherent design system without CSS-in-JS overhead |
| Tests | Vitest | Coverage of RBAC, idempotency and critical business rules |

## Notable technical decisions

**Real middleware RBAC** — access control lives in `src/middleware.ts` with a matcher that covers both base and nested routes. It is not frontend validation: unauthenticated requests get a `307`; insufficient roles get a `403` before reaching the handler.

**Per-channel, per-revision idempotency** — each publication generates a composite key `(publicationId, channel, revision)`. Retries use the same key, which prevents duplicates even if the client retries multiple times.

**Non-forgeable audit trail** — the reviewer identity is derived from the server-authenticated session (`src/server/auth/reviewer.ts`), not from the client body. Every state transition is recorded in `execution_events` with a timestamp and actor.

**Self-contained local fallback** — when the Supabase variables are not present, the services automatically switch to an in-memory `demo-store`. The full flow is demonstrable without external infrastructure.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use any of the demo credentials.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Editor | `editor@antigravity.local` | `demo-access` |
| Approver | `approver@antigravity.local` | `demo-access` |
| Admin | `admin@antigravity.local` | `demo-access` |

On the login form, the email field reveals the three accounts when clicked and the password is prefilled. Just press Enter.

## Main flow

1. **Editor** creates a publication and requests approval
2. **Approver** reviews it from their inbox and approves or rejects with a comment
3. The event is recorded in the history with status, actor and timestamp
4. **Admin** accesses system configuration (blocked for other roles)
5. Any retry of a failed publication respects the idempotency key

## Project structure

```
src/
├── app/                  # Routes and pages (App Router)
│   ├── (app)/            # Session-protected routes
│   └── api/              # REST endpoints
├── components/           # Shared UI
├── lib/                  # Domain logic and schemas
│   └── publishing/       # Idempotency and publishing rules
└── server/
    ├── auth/             # RBAC, role policy, reviewer identity
    └── repositories/     # Data access (Supabase + local fallback)
```

## Tests

```bash
npm run test
```

23 tests covering role-based access control, retry idempotency, schema validation and editorial-flow business rules.
