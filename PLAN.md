# PLAN - Regularizacion Audit-Ready Sandbox

Fecha de inicio: 2026-06-23
Estado: Regularizacion en ejecucion
Tipo de cliente: ficticio
Objetivo: dejar el proyecto listo para auditoria local (`audit-ready sandbox`) sin deploy ni publicacion externa.

## Alcance aprobado
- Normalizar artefactos fundacionales al workflow reforzado.
- Reclasificar el activo con metadata canonica.
- Endurecer Auth sandbox y RBAC minimo en paginas y APIs.
- Documentar arquitectura real, gaps y matriz full-stack.
- Preparar Supabase sandbox como fuente de verdad operativa.
- Ejecutar validaciones tecnicas locales y dejar bloqueos reales visibles.

## Fuera de alcance en esta fase
- GitHub sync, Vercel, sello parcial/final o `EXITO-TOTAL`.
- Integracion real con export n8n de produccion.
- SSO real o IdP corporativo.
- Cuentas reales de redes sociales o credenciales reales.

## Stack confirmado
| Decision | Valor |
|---|---|
| Framework | Next.js 15 + TypeScript |
| UI | Tailwind CSS + componentes accesibles propios |
| Runtime | Node.js 20+ |
| Datos | Supabase PostgreSQL |
| Auth | Auth.js Credentials bootstrap sandbox |
| Orquestacion | n8n como worker/orchestrator externo |
| Hosting objetivo futuro | Vercel o equivalente, fuera de esta fase |

## Workstreams
1. Artefactos y clasificacion canonica.
2. Auth sandbox y RBAC minimo verificable.
3. Supabase sandbox + contratos SQL.
4. Matriz full-stack, checklist y evidencia de bloqueo real.
5. Validaciones tecnicas locales previas a `audit` y `vuln`.

## Riesgos y bloqueos actuales
- `WF-011 PASS` bloqueado hasta provisionar Supabase sandbox.
- Pasada funcional UI completa bloqueada hasta contar con datos reales sandbox.
- `INSPECCION-VISUAL.md` bloqueado hasta poder verificar la UI conectada al sandbox.
- Integracion real n8n bloqueada por ausencia de export productivo.

## Criterio de salida de esta fase
- Artefactos fundacionales canonicos completos.
- RBAC sandbox activo para paginas y APIs.
- Validaciones tecnicas locales ejecutables sin warnings.
- Bloqueos de sandbox documentados con precision, sin simular `PASS`.
