# 00-ARQUITECTURA-PROYECTO

## Resumen ejecutivo
La aplicacion actua como centro de control editorial. `Next.js` expone UI y Route Handlers, `Supabase` es la fuente de verdad operativa y `n8n` queda fuera de la app como motor de orquestacion externo. La fase actual es `Audit-ready sandbox`: autenticar, revisar, aprobar y observar localmente sin deploy ni integracion real final.

## Stack decidido
- Framework/Lenguaje: `Next.js 15 + TypeScript`
- UI: `Tailwind CSS + componentes accesibles propios`
- Datos operativos: `Supabase PostgreSQL`
- Orquestacion: `n8n` como worker/orchestrator externo
- Auth: `Auth.js Credentials bootstrap sandbox`
- Observabilidad: `execution_events`, `correlationId`, estados por etapa y timeline por tarea

## Limites del sistema
- La app no guarda secretos de redes sociales ni ejecuta publicacion real en esta fase.
- `n8n` no es fuente de verdad; solo futuro ejecutor de jobs.
- `Supabase` concentra tareas, drafts, approvals, attempts, prompts y bindings cuando existen variables sandbox.
- Si faltan variables Supabase, los servicios usan un fallback local en memoria para validacion audit-ready sin secretos; no equivale a WF-011 con persistencia real.
- El acceso local usa identidades ficticias con roles `editor`, `approver`, `admin`.

## Decisiones vigentes
- `Google Sheets` queda fuera del circuito operativo.
- `LinkedIn`, `Facebook` e `Instagram` son los canales objetivo de sandbox.
- `X` y `Threads` permanecen documentados como canales secundarios de contrato, no como integracion cerrada.
- `SSO` real queda explicitamente fuera de alcance del tramo audit-ready sandbox.

## Gaps pendientes
- Provisionar Supabase sandbox y aplicar `supabase/schema.sql` + `supabase/seed.sql`.
- Recibir export real del workflow n8n para cerrar el migration map nodo-a-nodo.
- Ejecutar pasada funcional completa con UI conectada a sandbox.
- Ejecutar `WF-011` hasta `PASS` una vez exista entorno de datos real.

## MATRIZ PRODUCCION FULL-STACK
| Capa | Estado | Cobertura | Decision | Riesgo | Evidencia | Dueno | Gate |
|---|---|---|---|---|---|---|---|
| Frontend | APLICA | cubierta | Dashboard y vistas operativas funcionan sobre fallback-local; inspeccion visual SI | Mantener verde tras cambios | `src/app/(app)/*`, `INSPECCION-VISUAL.md` | Builder | GATE 7 |
| APIs y logica backend | APLICA | cubierta | Route Handlers + servicios server-side ejercitados contra fallback-local; tests verdes | Mantener verde tras cambios | `src/app/api/*`, `src/server/services/*`, `tests/*` | Builder | GATE 7 |
| Database y storage | NO APLICA | no_aplica | Persistencia real Supabase diferida a fase posterior (Nota de Cambio 02); la fuente de datos de esta fase es el fallback-local en memoria, sin infraestructura de DB que validar | N/A en alcance fallback-local | `src/server/repositories/demo-store.ts`, `comunicacion-cliente/2026-06-24-02-nota-de-cambio-realcance-fallback-local.md` | Builder | GATE 5 |
| Auth y access control | APLICA | cubierta | Auth.js sandbox + RBAC enforzado en middleware por pagina/API; identidad de revisor desde sesion | SSO real fuera de alcance (contrato) | `src/auth.ts`, `middleware.ts`, `src/server/auth/*` | Builder | GATE 8 |
| Hosting y deployment | APLICA | no_aplica | Fuera de alcance de esta fase | No hay deploy | `PLAN.md` | Strategist | GATE 9 |
| Cloud y compute | APLICA | no_aplica | Sin compute externo en esta fase | N/A por alcance local | `PLAN.md` | Strategist | GATE 9 |
| CI/CD pipeline | APLICA | no_aplica | No se habilita en regularizacion local | Sin pipeline todavia | `PLAN.md` | Strategist | GATE 9 |
| Version control | APLICA | cubierta | Repo git operativo en `main` | Riesgo bajo local | `.git`, `git status` | Executor | GATE 0 |
| Security y permissions | APLICA | cubierta | RBAC en middleware + hardening SSRF en url-policy + vuln PASS (0 vulnerabilidades) en esta sesion | Mantener audit limpio tras cambios de dep | `middleware.ts`, `src/lib/security/url-policy.ts`, `docs/GATE9_Revision_Reporte.md` | Asesor | GATE 8 |
| Rate limiting | APLICA | no_aplica | No expuesto a trafico externo en esta fase | N/A local | `PLAN.md` | Strategist | GATE 9 |
| Caching y CDN | APLICA | no_aplica | No aplica en sandbox local | N/A local | `PLAN.md` | Strategist | GATE 9 |
| Load balancing y scaling | APLICA | no_aplica | No aplica en sandbox local | N/A local | `PLAN.md` | Strategist | GATE 9 |
| Testing strategy | APLICA | cubierta | Typecheck, lint, vitest y build | Debe mantenerse en verde tras cambios | `package.json`, `tests/*` | Builder | GATE 7 |
| Observability | APLICA | cubierta | Timeline y metricas desde `execution_events` validadas sobre fallback-local (history/observability) | Mantener verde tras cambios | `src/server/services/execution-service.ts` | Builder | GATE 7 |
| Error tracking y alerting | NO APLICA | no_aplica | Canal de alerta real fuera de alcance fallback-local (Nota de Cambio 02); eventos y runbook documentan el manejo local | N/A sin runtime productivo | `docs/operations/runbook.md` | Strategist | GATE 8 |
| Cost management | APLICA | no_aplica | Costos reales fuera de alcance sandbox | N/A local | `PLAN.md` | Strategist | GATE 9 |
| Compliance y data privacy | NO APLICA | no_aplica | Proyecto ficticio sin PII ni datos reales; no hay datos personales que proteger en esta fase. Guardrail: prohibido mezclar credenciales/datos reales (Nota de Cambio 02) | N/A sin datos reales | `BRIEF.md`, `README.md`, `CLASIFICACION-ACTIVO.md` | Asesor | GATE 8 |
| Availability y recovery | NO APLICA | no_aplica | Backup/restore real diferido con la persistencia Supabase (Nota de Cambio 02); idempotencia y retry quedan modelados y probados en el fallback | N/A sin persistencia real | `src/lib/publishing/idempotency.ts`, `docs/operations/runbook.md` | Builder | GATE 8 |

## WF-011
Estado actual: `PASS` (alcance fallback-local audit-ready, Nota de Cambio 02)
Fecha: 2026-06-24
Motivo: matriz full-stack completa (todas las capas `cubierta` o `no_aplica` con razon especifica; ninguna `parcial` ni `bloqueada`); pasada funcional UI/API ejecutada contra el fallback-local en `http://localhost:3008`.
Evidencia funcional (flujo §6 del contrato, todos verdes):
- §6.1/§6.6 RBAC enforzado: unauth GET/POST `/api/publications` -> 401; unauth `/dashboard`,`/settings` -> 307 a `/login`; editor -> `/api/settings`(admin) y `/api/executions`(approver) -> 403; approver -> `/api/executions` -> 200, `/api/settings`(admin) -> 403.
- §6.3 crear publicacion (editor) -> 201; §6.4 request-approval (approver) -> 200; §6.5 approve (approver) -> 200 con transicion de estado; §6.8 retry (approver) -> 200.
- Identidad de revisor derivada de la sesion (no del body): editor intentando approve -> 403; campo `reviewer` del body ignorado por schema.
Hallazgo critico detectado y corregido en esta pasada: el `middleware.ts` estaba en la raiz del proyecto en vez de `src/middleware.ts`; con directorio `src/`, Next.js no lo cargaba y TODA la autorizacion estaba inactiva (BAC critico: datos y mutaciones accesibles sin sesion). Corregido moviendolo a `src/middleware.ts` y endureciendo el `matcher` para cubrir rutas base + anidadas. Verificado post-fix (ver evidencia arriba).
Pendiente fase real (diferido): provisionar Supabase sandbox y re-ejecutar WF-011 con persistencia real (migracion `get-real` o sandbox).


