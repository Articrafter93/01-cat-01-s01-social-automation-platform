# 01-BRIEFING

## Objetivo
- Transformar un workflow experimental de automatización social en una plataforma productiva, auditable y segura.

## Audiencia
- Equipo interno de operaciones/editorial.
- Roles previstos: `admin`, `editor`, `approver`.

## Ruta destino
- `C:\Users\g-cub\Antigravity projects\proyectos\automatizador de redes sociales - N8N`

## Decisión de API
- API requerida: sí
- API propia: `Sí`
- Implementación: `Next.js Route Handlers como capa operativa del producto`

## Redes oficiales de la iteración
- LinkedIn
- Facebook
- Instagram
- X (draft fallback)
- Threads (draft fallback)

## Problema actual
- Flujo monolítico en n8n con scraping, LLM, imágenes, publicación y estado en una sola cadena.
- Secretos expuestos y dependencia operativa de Google Sheets.
- Riesgo alto de duplicidad, publicación cruzada, errores silenciosos y baja trazabilidad.

## Resultado esperado
- App operativa con control editorial y observabilidad.
- n8n desacoplado por subworkflows.
- Estados, approvals y auditoría centralizados en backend propio.
