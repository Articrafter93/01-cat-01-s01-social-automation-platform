# 02-ARQUITECTURA-SITIO

## Sitemap final
- `/dashboard`
- `/publications/new`
- `/publications/[id]`
- `/approvals`
- `/history`
- `/observability`
- `/settings`
- `/privacidad`

## Tipos de pagina y componentes obligatorios
- Dashboard: KPIs, estado del sistema, eventos recientes, tabla de pipeline.
- Nueva publicación: formulario de ingesta, guardrails, enlace a privacidad.
- Detalle de publicación: resumen, drafts, attempts, timeline y acciones.
- Aprobaciones: preview por canal y acciones editoriales.
- Historial: tabla de ejecuciones y acceso a detalle.
- Observabilidad: costos, latencias, eventos y retries.
- Configuración: integraciones, prompts y metadatos de rotación.

## Componentes principales
- Shell con navegación lateral y modo claro/oscuro.
- Dashboard con KPIs y eventos recientes.
- Formulario de creación de tarea.
- Bandeja de aprobación con preview por canal.
- Vista de detalle por publicación con timeline y attempts.
- Settings con prompts e integraciones.

## Reglas SEO y metadata
- `metadataBase`, `canonical`, `robots`, `sitemap`.
- Ruta de privacidad visible desde formularios operativos.
- Metadatos consistentes para vistas operativas y enlace canónico de dashboard.

## Reglas SEO
- Indexación permitida sólo para vistas operativas públicas controladas.
- `/api/*` fuera de indexación.
- Sitemap y robots generados desde App Router.

## Navegación
- Navegación lateral persistente.
- Acceso al detalle desde dashboard e historial.
- Retorno al estado operativo principal en un clic.
