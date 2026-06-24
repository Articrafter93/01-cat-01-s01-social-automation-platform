# Nota de Cambio 02 — Re-alcance a fallback-local audit-ready y habilitación de sello parcial

Fecha: 2026-06-24
Tipo de cliente: ficticio
Proyecto: Automatizador de Redes Sociales (N8N)
Autoriza: developer (decisión explícita en chat, 2026-06-24)
Documento base que enmienda: `comunicacion-cliente/2026-06-23-01-correo-corporativo-inicial.md`

## Motivo

El contrato inicial (Paso 1.0) definió Supabase como fuente de verdad (§3) y dejó el
sello parcial fuera de alcance (§4), con la provisión del sandbox Supabase como
dependencia abierta (§7). En la fase actual no se dispone de credenciales de un
sandbox Supabase real por canal seguro, y la app ya cuenta con un **fallback local
audit-ready en memoria** (`demo-store`) que ejercita el flujo UI/API completo sin
secretos. El developer decide cerrar esta fase sobre el fallback-local y habilitar el
sello parcial para el alcance sandbox-first ficticio.

## Cambios al contrato

### Enmienda al §3 — Alcance aprobado (fuente de verdad)
- **Antes:** "Supabase como fuente de verdad".
- **Ahora (esta fase):** **fallback-local audit-ready en memoria** (`src/server/repositories/demo-store.ts`)
  como fuente de datos de esta fase ficticia. La integración con **Supabase como fuente de
  verdad real queda diferida** a una fase posterior (migración vía `get-real` o provisión de
  sandbox). El fallback no reclama persistencia real: es validación funcional sin credenciales.

### Enmienda al §4 — Fuera de alcance
- **Antes:** incluía "sello parcial, sello final o exito total" como fuera de alcance.
- **Ahora:** se retira **"sello parcial"** de fuera de alcance para esta fase ficticia.
  Se habilita la emisión del **`SELLO DE APROBACION PARCIAL`** sobre el alcance
  fallback-local audit-ready. **Permanecen fuera de alcance:** sello final, éxito total
  de producción real, deploy, SSO real, credenciales/cuentas reales, export productivo
  n8n final.

## Guardrails que se preservan (sin cambio)

- `tipo_cliente: ficticio` — el sello parcial acredita **exhibición pública verificada
  sandbox-first**, NO producción real, datos reales ni claims de compliance.
- Roles obligatorios (§2), riesgos a controlar (§5) y pruebas de aceptación del tester
  humano (§6) se mantienen idénticos y siguen siendo vinculantes.
- La persistencia real Supabase y el export real de n8n siguen como dependencias
  abiertas para fases futuras (§7).

## Impacto en gates

- `MATRIZ PRODUCCION FULL-STACK` se actualiza: las capas dependientes de persistencia
  real pasan a `no_aplica` con razón específica (diferido a fase real) y las cubiertas
  por el fallback/UI/seguridad pasan a `cubierta`.
- `WF-011` se ejecuta contra el fallback-local y se actualiza a `PASS` para el alcance
  re-definido.
- `cliente-exigente` Modo B audita contra **este contrato enmendado**.

## Validez

Esta Nota de Cambio es vinculante desde su fecha. Cualquier reversión del re-alcance
(volver a exigir Supabase como fuente de verdad de esta fase) invalida los sellos
emitidos bajo ella.
