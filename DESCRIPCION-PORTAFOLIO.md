# PORTFOLIO DESCRIPTION

**Project:** Social Automation Platform (CAT-01-S01)
**Status:** Final approval seal active
**Category:** CAT-01 — Operational Automations
**Version:** commit `eb4e61e`
**Public URL:** https://01-cat-01-s01-automatizador-de-rede.vercel.app
**Repository:** https://github.com/Articrafter93/01-cat-01-s01-automatizador-de-redes-sociales-n8n

## Executive summary
An editorial control center for a social-publishing automation pipeline. It turns a single source URL (article or YouTube) into multi-channel social drafts that move through an approval gate, an auditable execution timeline, and idempotent publishing — so a fragile scrape → AI → publish chain becomes a traceable, governed operation.

## Purpose and goals
Show that a "post everything everywhere" automation can be **safe and reviewable**: editorial control before anything goes out, role separation, a full audit trail, and no duplicate posts across channels. The asset demonstrates production-grade backend discipline (RBAC, idempotency, SSRF hardening) inside a sandbox-first demo.

## What it can do
- Ingest a source and generate per-channel drafts (LinkedIn, Facebook, Instagram, X, Threads).
- Role-gated approve / reject / request-changes with a complete event timeline.
- Retry that preserves the publish idempotency key (no duplicate posts).
- Role-aware UI (admin / approver / editor) with access-denied gating and an operational metrics dashboard.

## Architecture and framework
Next.js (App Router) with server actions and middleware-enforced RBAC. Auth.js handles sandbox sessions with a deliberate production opt-in for the demo login. The data layer is dual-mode: Supabase Postgres when configured, otherwise a sandbox store that — to survive Vercel's stateless serverless runtime — persists to **Upstash Redis via key-prefix pooling**. Ingestion is guarded by an SSRF-hardened URL policy and HTML sanitization.

## Tools involved
<!-- dependency | level | limit -->
- **Vercel** (hosting/deploy) — `GRATIS_INDEFINIDO` (Hobby free tier).
- **Upstash Redis** (serverless persistence) — `GRATIS_CON_LIMITE` (free tier: 1 DB, ~500K commands/month, 256 MB; key-prefix pooling shares the single free DB).
- **Auth.js / NextAuth** (sandbox RBAC) — no external cost.
- Libraries: Next.js, TypeScript, Tailwind CSS, Zod, Prisma client, `sanitize-html`, Vitest.

## Integrations and external services
Deployed demo runs sandbox-first: scraping, AI generation and channel publishing are **simulated** (no live third-party API calls). The data layer is Supabase-ready; the live demo persists to Upstash Redis. n8n orchestration is defined as a contract (`n8n/`) for production wiring.

## Final approval evidence
- `SELLO DE APROBACION FINAL.md` — active (2026-06-27).
- Vercel deploy `READY` + second human functional verification (VFH) on the live URL, developer-confirmed.
- Deployed commit: `eb4e61e`.

## Guide for recruiter or client
Open the public URL, pick a demo account from the login selector (password is pre-filled), and you land in the editorial panel. Create a publication from a URL, send it through the approval gate, approve it as the approver role, and watch the audit timeline update — state stays consistent across views. Try `/settings` as a non-admin to see role gating block you with a visible message. Everything is sandbox data; no real accounts or sends.
