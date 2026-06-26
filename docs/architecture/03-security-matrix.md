# Security matrix

| Surface | Risk | Control |
|---|---|---|
| n8n historical export | Exposed secrets | Immediate rotation, no reuse, exposure review |
| External URLs | SSRF / private hosts | Allowlist, strict host validation, RFC1918 blocking, timeout |
| LLM JSON | Invalid output | Zod validation + payload rejection |
| Social publishing | Duplication | Per-channel idempotency key |
| Integrations | Over-privilege | Minimal scopes per environment |
| Internal webhooks | Forgery | HMAC signature and verification at the API |
| Operational UI | Secret exposure | Visible metadata; secrets kept out of the UI |
