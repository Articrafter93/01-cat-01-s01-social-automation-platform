# Checklist de operacion sandbox

## Antes de validar
- Credenciales sandbox cargadas por ambiente sin exponer valores.
- `supabase/schema.sql` aplicado.
- `supabase/seed.sql` aplicado.
- Login sandbox operativo para `editor`, `approver` y `admin`.

## Smoke test local
- Crear tarea desde la UI.
- Solicitar aprobacion.
- Aprobar o rechazar.
- Reintentar publicacion manteniendo `idempotencyKey`.
- Ver timeline y metricas en dashboard/historial/observabilidad.

## Cierre de esta fase
- Registrar resultado de `WF-011`.
- Registrar pasada funcional local.
- Ejecutar `audit` y `vuln` solo si el sandbox ya responde.
