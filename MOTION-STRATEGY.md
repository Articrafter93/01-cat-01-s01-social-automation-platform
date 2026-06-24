# MOTION-STRATEGY

Nivel de dinamismo: medium

## Principios
- Animaciones discretas de 180–220 ms.
- Skeleton loaders sólo en estados de carga.
- Expansión suave en paneles y badges.
- Nada de motion decorativo que complique el escaneo operativo.

## Guardrails
- Respetar `prefers-reduced-motion`.
- No animar métricas críticas si puede inducir error o ambigüedad.
- Mantener contraste y legibilidad antes que espectáculo.

## Aplicación
- Navegación lateral: transición suave.
- Badges y botones críticos: microfeedback claro.
- Timeline y cards: aparición sobria.
