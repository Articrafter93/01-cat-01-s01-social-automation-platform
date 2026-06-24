# Retries e idempotencia

## Regla base
- Un publish intent no se repite si conserva la misma combinación `normalizedUrl + canonicalDate + channel + accountId + approvedRevision`.

## Estrategia
- `retryable_error`: se permite retry exponencial desde n8n y retry manual desde UI.
- `fatal_error`: se congela la tarea hasta intervención humana.
- Cada retry conserva `correlationId` y agrega traza en `ExecutionEvent`.

## Circuit breaker
- APIs externas con fallo sostenido cambian a estado degradado.
- `publish-channel` no intenta publicar en una integración degradada; envía `notify-ops` y deja el estado visible.
