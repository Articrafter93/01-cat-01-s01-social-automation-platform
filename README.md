# README

## Estado
- Proyecto de portafolio ficticio.
- Alcance actual: regularizacion `Audit-ready sandbox`.
- No listo para deploy, publicacion externa ni cierre final.

## Objetivo
Demostrar un sistema interno de orquestacion editorial sobre `Next.js + Supabase + n8n`, con control de roles, aprobacion, trazabilidad e idempotencia por canal.

## Estado operativo
- La app existe y tiene flujo UI/API real.
- La seguridad de acceso sandbox ya exige sesion y rol.
- La app puede ejecutarse localmente con fallback audit-ready cuando faltan variables Supabase; Supabase sigue siendo la fuente de verdad cuando esta configurado.
- `WF-011` con persistencia Supabase real sigue bloqueado hasta provisionar el sandbox y ejecutar evidencia local conectada.

## Acceso sandbox
- `editor@antigravity.local`
- `approver@antigravity.local`
- `admin@antigravity.local`
- Cualquier contrasena de 8 o mas caracteres fuera de produccion.

## Dependencias abiertas
- Ejecutar pasada funcional local con fallback audit-ready y documentar evidencia visual/funcional.
- Provisionar Supabase sandbox y aplicar `supabase/schema.sql` + `supabase/seed.sql`.
- Recibir export real de n8n para cerrar el migration map nodo-a-nodo.
- Ejecutar `WF-011`, pasada funcional, `audit` y `vuln` cuando el sandbox exista.


