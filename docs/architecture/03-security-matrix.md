# Matriz de seguridad

| Superficie | Riesgo | Control |
|---|---|---|
| Export histórico n8n | Secretos expuestos | Rotación inmediata, no reutilización, revisión de exposición |
| URLs externas | SSRF / hosts privados | Allowlist, validación estricta de host, bloqueo RFC1918, timeout |
| LLM JSON | Salida inválida | Validación Zod + rechazo de payload |
| Publicación social | Duplicidad | Idempotency key por canal |
| Integraciones | Sobreprivilegio | Scopes mínimos por ambiente |
| Webhooks internos | Falsificación | Firma HMAC y verificación en API |
| UI operativa | Exposición de secretos | Metadatos visibles; secretos fuera de UI |
