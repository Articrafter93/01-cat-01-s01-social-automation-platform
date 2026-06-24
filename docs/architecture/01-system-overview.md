# Social Automation Platform

## Arquitectura
- `Next.js 15 + Prisma + PostgreSQL` actúa como producto, RBAC, approvals, auditoría y fuente de verdad.
- `n8n` ejecuta subworkflows desacoplados y sólo reporta eventos/estados a la API interna firmada.
- `Redis` sostiene `queue mode` para retries y desacople de ejecución.

## Componentes principales
- `Operational API`: crea tareas, administra estados, aprobaciones, retries e integraciones.
- `Editorial UI`: dashboard, nueva publicación, approvals, historial, observabilidad y settings.
- `Workflow layer`: parent workflow y subworkflows por etapa con contratos JSON fijos.
- `Security layer`: secret storage externo, allowlist de scraping, webhook signing, audit trail.

## Fuente de verdad
- Tablas núcleo: `PublicationTask`, `SourceAsset`, `ChannelDraft`, `ApprovalDecision`, `PublishAttempt`, `ExecutionEvent`, `IntegrationBinding`, `PromptTemplate`.
- Google Sheets queda fuera del circuito operativo. Sólo se acepta import de backlog como migración controlada.
