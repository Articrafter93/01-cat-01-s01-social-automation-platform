# CHECKLIST-CONTROL

- [x] GATE 0 Seguridad cargado y ruta confirmada.
- [x] GATE 1 Briefing definido.
- [x] GATE 2 Alcance definido para `Audit-ready sandbox`.
- [x] GATE 3 Arquitectura tecnica regularizada y matriz full-stack declarada.
- [x] GATE 4 Direccion visual documentada.
- [x] GATE 5 Setup reproducible local y SQL sandbox listos.
- [x] GATE 6 Desarrollo regularizado a nivel de auth, RBAC y contratos app/API.
- [ ] GATE 7 QA funcional completo.
- [ ] GATE 8 Seguridad pre-deploy cerrada.
- [ ] GATE 8.7 Pasada funcional obligatoria.
- [ ] WF-011 PASS.

## Estado de bloqueo actual
- `WF-011`: NO_EJECUTADO. Falta Supabase sandbox y evidencia local real.
- `INSPECCION-VISUAL.md`: pendiente. No debe emitirse sin verificar la UI conectada a sandbox.
- `audit` y `vuln`: pendientes del estado regularizado con datos reales sandbox.

## Politica de pasada funcional obligatoria
- Levantar servicios reales del sandbox.
- Validar creacion de tarea desde UI.
- Validar endpoint interno afectado.
- Validar reflejo del estado en UI.
- Registrar evidencia observable antes de recomendar `audit` o `vuln`.

## Evidencia actual
- Auth sandbox con roles `editor`, `approver`, `admin`.
- Middleware con enforcement de sesion/rol sobre paginas y APIs.
- `supabase/schema.sql` y `supabase/seed.sql` listos para aplicar.
- `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` siguen siendo la validacion tecnica minima exigida.
- No existe evidencia valida de sandbox conectado hasta provisionar `.env.local` por canal seguro.
