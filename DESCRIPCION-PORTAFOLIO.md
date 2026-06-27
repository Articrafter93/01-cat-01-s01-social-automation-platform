# DESCRIPCION DE PORTAFOLIO

**Proyecto:** Social Automation Platform (CAT-01-S01 — Automatizador de Redes Sociales N8N)
**URL:** https://01-cat-01-s01-automatizador-de-rede.vercel.app
**Estado:** sello-final-vigente
**Fecha:** 2026-06-27

## Resumen
Editorial control center for a social-publishing automation pipeline: it turns a source URL (article or YouTube) into multi-channel social drafts that move through an approval gate, an auditable execution timeline and idempotent publishing — so a fragile scrape→AI→publish chain becomes a traceable, governed operation.

## Que hace
- Ingest a source and generate per-channel drafts (LinkedIn, Facebook, Instagram, X, Threads).
- Editorial gate with role-based approve / reject / request-changes and a full event audit trail.
- Retry that preserves the publish idempotency key (no duplicate posts across channels).
- Role-aware UI (admin / approver / editor) with access-denied gating and a dashboard of operational metrics.

## Como lo hace
Next.js (App Router) with server actions and middleware-enforced RBAC. Auth.js handles sandbox sessions with a deliberate production opt-in for the demo login. The data layer is dual-mode: Supabase Postgres when configured, otherwise a sandbox store that — to survive Vercel's stateless serverless runtime — persists to Upstash Redis via key-prefix pooling. SSRF-hardened URL policy and HTML sanitization guard ingestion.

## Herramientas y frameworks
- Next.js + TypeScript + Tailwind
- Auth.js (RBAC middleware), Zod validation
- Upstash Redis (serverless persistence), Supabase-ready
- Vitest (tests), Vercel para despliegue y verificacion publica

## Evidencia
- Sello final: `SELLO DE APROBACION FINAL.md`
- Commit desplegado: `eb4e61e`
- Deployment: https://01-cat-01-s01-automatizador-de-redes-sociales-n8n-js30iyvn1.vercel.app
