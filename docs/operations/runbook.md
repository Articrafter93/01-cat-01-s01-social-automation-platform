# Runbook operativo sandbox

## Incidente: falla de acceso
1. Confirmar que el usuario sandbox tenga rol esperado por email.
2. Verificar redireccion a `/login` o respuesta `401/403` en API.
3. Repetir con `editor`, `approver` y `admin` para confirmar enforcement.

## Incidente: falla de extraccion o persistencia
1. Revisar `execution_events` por `correlationId`.
2. Confirmar que Supabase sandbox este provisionado y con `schema` aplicado.
3. Si la fuente no es segura o el sandbox no responde, bloquear `WF-011` y registrar evidencia.

## Incidente: publicacion parcial o retry
1. Revisar `publish_attempts` por canal.
2. Confirmar aprobacion por canal.
3. Reintentar solo el canal fallido conservando `idempotencyKey`.

## Incidente: credencial comprometida
1. Rotar proveedor sandbox afectado.
2. Reinyectar credenciales por canal seguro.
3. Mantener el proyecto bloqueado hasta revalidar acceso y permisos.
