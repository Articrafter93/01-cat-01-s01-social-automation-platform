# Comunicacion con Clientes — automatizador de redes sociales - N8N

Esta carpeta centraliza toda la comunicacion con el cliente de este proyecto.

## Convencion de naming

```
YYYY-MM-DD - <tipo> - <asunto-en-kebab-case>.md
```

**Tipos disponibles:**
- `correo-entrante` — Email o mensaje recibido del cliente.
- `correo-saliente` — Email o mensaje enviado al cliente.
- `nota-llamada` — Resumen de una llamada o reunion.
- `acuerdo` — Acuerdo formal o cambio de alcance aprobado.
- `feedback` — Comentarios del cliente sobre avances o entregables.
- `cambio-alcance` — Solicitud de cambio de alcance documentada.

## Ejemplo

```
2026-05-10 - correo-entrante - solicitud-cambio-paleta-colores.md
2026-05-11 - nota-llamada - kickoff-semana-2.md
2026-05-15 - acuerdo - extension-plazo-entrega.md
```

## Nota

Esta carpeta es la fuente de verdad de la comunicacion con el cliente. Si el proyecto
tiene una carpeta `docs/comunicacion/` heredada, esta queda como espejo informativo.

