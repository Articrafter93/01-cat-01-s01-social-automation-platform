# VERIFICACION-FUNCIONAL-HUMANA — CAT-01-S01 (Automatizador de Redes Sociales N8N)

> **Gate VFH (hard blocker de `SELLO PARCIAL` y `SELLO FINAL`).** Registra la confirmacion humana, expresa y directa del developer de que el activo funciona correctamente en la practica — no solo que pasan lint/build/tests/gates.
>
> El agente NO autoemite ni infiere esta confirmacion. Solo cuenta un mensaje directo del developer en el chat.

---

## Verificacion para SELLO PARCIAL (comportamiento real local)

- **Fecha:** 2026-06-26
- **Estado:** `CONFIRMADO`
- **Alcance verificado:** local / `http://localhost:3000`
- **Render:** `rend` (Next.js dev, Chromium/Playwright) — render OK
- **Tipo de proyecto:** portafolio (`tipo_cliente: ficticio` + candidato) → §6 con **lente de reclutador** (acciones de negocio + innegociables runtime), conforme a la regla "VFH — lente de reclutador en el §6".

### Lista §6 ejercida en vivo (negocio + innegociables runtime de reclutador)

> Cada item no trivial respaldado con **screenshot consecutivo** en `reports/vfh/`. Items triviales (login por rol, logout) exentos de screenshot.

| # | Item | Resultado observado | Evidencia |
|---|---|---|---|
| 1 | Login con cuentas demo (selector + pass `demo-access` prellenada) | Entra sin teclear; cada rol aterriza en su vista | trivial (exento) |
| 2 | Crear publicacion desde la UI | Tarea creada con ID nuevo, evento `ingest`, aparece en History | `reports/vfh/vfh-02a-create-form-filled.png`, `vfh-02b-create-result-detail.png`, `vfh-02c-create-in-history-list.png` |
| 3 | Gate / solicitar aprobacion | Estado `draft` → `needs approval`, last stage `editorial-gate`, evento `request-approval` | `reports/vfh/vfh-03a-gate-before-draft.png`, `vfh-03b-gate-after-needs-approval.png` |
| 4 | Aprobar/Rechazar como `approver` | Estado cambia a `approved` y persiste en History | verificado en vivo (History `approved`) |
| 5 | Historial / audit trail con eventos | Execution timeline cronologico con fetch/extract/generate/gate/approve/reject | `reports/vfh/vfh-05-history-audit-timeline.png` |
| 6 | Retry sin romper idempotencia | 2 retries → 2 eventos pero **1 solo** attempt de canal (misma llave reusada, sin duplicado) | `reports/vfh/vfh-06a-retry-before.png`, `vfh-06b-retry-after-idempotent.png` |
| 7 | Controles vivos (Approve/Reject/Gate/Retry reaccionan) | Reaccionan al clic; fix CSP `next.config.ts` aplicado | verificado (ver #2/#3/#6) |
| 8 | Mensajes de error rojos/inequivocos | 403 muestra "Forbidden" rojo; token `text-danger` (fix de `text-destructive` fantasma) | `reports/vfh/denied-banner-red.png` |
| 9 | Sin rebotes silenciosos | Acceso denegado muestra banner rojo, no rebote mudo | `reports/vfh/denied-banner-red.png` |
| 10 | Estado coherente entre vistas | Approve en Approvals se refleja en History (fix `globalThis` del store) | verificado en vivo |
| 11 | Empty states | Bandeja vacia muestra "You're all caught up" | `reports/vfh/approvals-empty-state.png` |
| 12 | Gating de rol bloquea en la UI con aviso | No-admin en `/settings` → banner rojo "Access denied… Administrator role" | `reports/vfh/denied-banner-red.png` |
| 13 | Logout → `/login` → re-ingreso con otro rol | "Sign out" devuelve a `/login`; re-ingreso OK | trivial (exento) |
| 14 | Login mock sin friccion (selector + pass prellenada) | Selector despliega cuentas, pass prellenada | trivial (exento) |

### Confirmacion del developer

- **Frase literal del developer (copiada del chat):** "la apruebo, sigamos"
- **Confirmado por:** developer (Fabian Cubillos)
- **Resultado VFH local:** `SI`

---

## Verificacion para SELLO FINAL (URL desplegada — la emite `vrc`)

- **Estado:** `PENDIENTE` (aun no desplegado)

---

## Notas

- La VFH se ejercio con `cliente-exigente`/`reclutador-exigente` como lente: los 14 items incluyen los innegociables runtime de reclutador, cada no trivial con screenshot consecutivo.
- **Pendiente antes del `SELLO PARCIAL`:** re-validar los gates que predatan los cambios de esta sesion (re-`inspeccion-visual` con pasada de interaccion, re-`reclutador-exigente`, `revision-final` tecnico + `WF-011`, `cliente-exigente` Modo B `EXITO TOTAL`) sobre el codigo actual. Esta VFH es una de las 6 condiciones del sello, no el sello.
