# REVISIÓN RECLUTADOR EXIGENTE — CAT-01-S01 (Automatizador de Redes Sociales N8N)

**Fecha:** 2026-06-26
**Aplicabilidad:** APLICA (portafolio — `tipo_cliente: ficticio` + candidato bajo `programa-portafolio-60`)
**Re-validación:** sobre el código actual tras traducción a inglés + 6 fixes de la sesión 2026-06-26. Reemplaza la versión previa (2026-06-25, stale: predataba los fixes).

## Resultado

APTO_PORTAFOLIO

> Nota de proceso: la auditoría **encontró un cabo suelto** (README usaba la jerga interna "Audit-ready", línea 30) → se corrigió a "Self-contained local fallback" y se re-validó. El gate hizo su trabajo (no rubber-stamp).

## Checklist item por item

### Capa 1 — Primera impresión (README recruiter-facing)
| Item | Estado | Evidencia |
|---|---|---|
| Abre con el problema de negocio, no con el stack | PASS | `README.md:3-9` |
| Stack con justificación por tecnología | PASS | `README.md:13-20` (columna Rationale) |
| Quick start ≤2 comandos | PASS | `README.md:34-37` (`npm install` / `npm run dev`) |
| Credenciales demo visibles y utilizables | PASS | `README.md:43-49` |
| Login mock sin fricción (selector + pass prellenada + logout) | PASS | `README.md:49`; verificado live (VFH #1/#13/#14) |
| Sin jerga interna del workspace | PASS | corregido "Audit-ready"→"Self-contained" (`README.md:30`); grep jerga = 0 |
| Coherencia nombre↔contenido (anti-ilusión n8n) | PASS | `README.md:9,18` — scoping honesto "simulated in memory; in production connects to n8n via webhook" |
| Idioma recruiter-facing = inglés | PASS | README + UI + identificadores/comentarios + datos demo en inglés; español residual en `src/` = 0 |
| 2-3 decisiones técnicas no obvias explicadas | PASS | `README.md:22-30` (RBAC middleware, idempotencia compuesta, audit trail no falsificable, fallback local) |

### Capa 2 — Honestidad de los tests
| Item | Estado | Evidencia |
|---|---|---|
| Asserts verifican negocio, no el mock (no fixture-circular) | PASS | `tests/domain/idempotency.test.ts` asserta la lógica de la llave |
| Nombres describen comportamiento | PASS | "keeps the same key for the same publication identity", "changes when the revision changes" |
| Existe test que fallaría si la lógica se rompe | PASS | idempotencia + auth-policy + url-policy |
| Tests de servicio capturan lo calculado, no lo del mock | PASS | `tests/api/publications-service.test.ts` (23 tests, 5 files, todos PASS) |

### Capa 3 — Profundidad y comentarios
| Item | Estado | Evidencia |
|---|---|---|
| Comentarios explican el *por qué* | PASS | `guard.ts` (RBAC boundary Node-runtime), `app-shell.tsx` (logout server action), `middleware.ts` |
| Afirmaciones del README implementadas y verificables | PASS | RBAC, idempotencia, audit trail — verificados live en VFH |
| Control de acceso en frontera real (server/middleware) | PASS | `src/middleware.ts` + `src/server/auth/guard.ts` (`requireApiRole`/`requirePageRole`) |
| Dependencias justificadas | PASS | stack mínimo coherente |

### Capa 4 — Red flags
| Item | Estado | Evidencia |
|---|---|---|
| Sin console.log/debug productivo | PASS | grep `src/` = 0 |
| Sin credenciales/tokens hardcodeados | PASS | password demo = excepción sandbox legítima (bloqueada en prod) |
| Sin `.env` versionado | PASS | `.gitignore` cubre `.env*`; presence-only |
| Rutas protegidas realmente bloqueadas | PASS | verificado live (VFH #12: `/settings` no-admin → banner + 403) |
| Sin errores 500 en flujo principal | PASS | VFH completa sin 500 |
| Sin TODO/FIXME/HACK/XXX sin ticket | PASS | grep `src/` = 0 |

### Innegociables runtime (fuente del §6 VFH, verificados en vivo)
| Item | Estado | Evidencia |
|---|---|---|
| Controles vivos (sin botones muertos) | PASS | fix CSP; VFH #7 |
| Errores rojos visibles | PASS | fix `text-danger`; `reports/vfh/denied-banner-red.png` |
| Sin rebotes silenciosos | PASS | banner acceso denegado; VFH #9 |
| Estado coherente entre vistas | PASS | fix `globalThis`; VFH #10 |
| Empty states | PASS | `reports/vfh/approvals-empty-state.png`; VFH #11 |
| Gating de rol bloquea en UI con aviso | PASS | VFH #12 |
| Logout + login sin fricción | PASS | VFH #13/#14 |

## Veredicto final

**APTO_PORTAFOLIO** — todas las capas + innegociables runtime pasan. Satisface la 6.ª condición del `SELLO DE APROBACION PARCIAL`.
