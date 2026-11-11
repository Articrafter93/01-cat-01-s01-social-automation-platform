# Social Automation Platform

An internal editorial orchestration system that manages the full lifecycle of a publication: from draft creation through approval, execution and event traceability. Built for content teams that need role-based access control, an auditable history and idempotency on publishing retries.

## The problem it solves

Content teams operating across multiple channels (social networks, newsletters, blogs) need a centralized control point before running external publications. Without it, you get duplicates, lost approvals and no traceability of who did what and when.

This platform acts as the editorial orchestration layer: it receives the tasks, applies the approval flow and records every state transition before delegating execution to the external engine. In this demo, the execution layer is simulated in memory; in production it would connect to n8n (or another orchestrator) via webhook.

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Server-rendered pages and REST route handlers in one deployable app |
| Auth + sessions | Auth.js v5 | Native Next.js integration; extensible to OAuth providers |
| Database | Supabase (PostgreSQL) | A dedicated schema (`cat_01_s01`) inside a shared project; without Supabase the app runs on its in-memory store |
| Orchestration | n8n (interface defined) | Separation between the editorial logic (this app) and external execution; in the demo the execution layer runs in memory |
| Styling | Tailwind CSS + shadcn/ui | A coherent design system without CSS-in-JS overhead |
| Tests | Vitest | Coverage of the role policy, the demo login, idempotency, the retry rule, the URL policy and critical business rules |

## Notable technical decisions

**Server-side RBAC** — `src/middleware.ts` is a coarse, Edge-safe gate: a request without a session cookie gets a `307` to `/login` (pages) or a `401` (API). The security boundary is in the Node-runtime guards (`src/server/auth/guard.ts`): an API handler answers `403` to an insufficient role, and a page sends the user back to the dashboard with an access-denied notice. The route-to-role map lives in `src/server/auth/policy.ts`. It is not frontend validation.

**Per-channel, per-revision idempotency** — each publish attempt carries a key derived from the source and the approved draft: the SHA-256 of `normalizedUrl:canonicalDate:channel:accountId:approvedRevision` (`src/lib/publishing/idempotency.ts`). A retry requeues the attempt with the same key, so the same content is never posted twice, and a newly approved revision gets a new key.

**Non-forgeable reviewer identity** — the reviewer is derived from the server-authenticated session (`src/server/auth/reviewer.ts`), not from the client body, and stored with each approval decision. Every state transition is recorded in `execution_events` with its stage, status and timestamp.

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
2. **Approver** reviews it from their inbox and approves or rejects it
3. The transition is recorded in the publication's timeline with stage, status and timestamp, and the reviewer, taken from the session, is stored with the approval decision
4. **Admin** accesses system configuration (blocked for other roles)
5. **Approver** retries a failed or partially published publication: only the channels whose current draft passed the editorial gate and did not go out return to the queue, each with its idempotency key, so nothing is posted twice

The seeded publication *Planning an editorial calendar that survives a failed channel* is ready to retry. In the hosted demo the state is shared between visitors and the simulated execution layer never publishes queued channels, so after the first retry it stays in *processing* and the Retry button explains why it is disabled.

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

63 tests covering the demo login and the route-to-role policy, the retry rule (editorial gate, idempotency, concurrent retries and rollback), the seeded demo data, the source URL policy (SSRF blocking), schema validation and editorial-flow business rules.
