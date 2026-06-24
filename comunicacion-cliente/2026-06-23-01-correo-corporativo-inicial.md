# Correo corporativo inicial

Fecha: 2026-06-23
Tipo de cliente: ficticio
Proyecto: Automatizador de Redes Sociales (N8N)
Resultado de suficiencia del brief: COMPLETADO_POR_CLIENTE_EXIGENTE

## 1. Objetivos y requisitos
Se aprueba construir un sandbox funcional de una plataforma interna de orquestacion editorial que permita:
- crear tareas de publicacion desde una fuente valida;
- enrutar borradores por canal;
- solicitar aprobacion editorial antes de publicar;
- registrar eventos, estados y reintentos con trazabilidad;
- demostrar idempotencia por canal y revision.

## 2. Roles obligatorios
- `editor`: crea contenido y levanta el gate editorial.
- `approver`: aprueba, rechaza y revisa observabilidad operativa.
- `admin`: administra settings del sandbox.

## 3. Alcance aprobado de esta fase
- sandbox local auditable;
- datos ficticios;
- Supabase como fuente de verdad;
- Auth.js bootstrap no productivo;
- n8n documentado como orquestador externo, sin integracion real cerrada.

## 4. Fuera de alcance
- deploy;
- SSO real;
- credenciales o cuentas reales;
- export productivo n8n final;
- sello parcial, sello final o exito total.

## 5. Riesgos que deben controlarse
- publicaciones duplicadas;
- cambios de estado sin trazabilidad;
- acciones sensibles sin rol suficiente;
- dependencia de datos mock sin validar persistencia real.

## 6. Pruebas de aceptacion del tester humano
1. Iniciar sesion con un usuario sandbox valido.
2. Ver el dashboard sin acceder a una ruta publica de marketing.
3. Crear una nueva publicacion desde la UI.
4. Solicitar aprobacion de una tarea existente.
5. Aprobar o rechazar desde la bandeja con el rol correcto.
6. Intentar acceder a `settings` con un rol no autorizado y verificar bloqueo.
7. Revisar historial y observabilidad para una tarea con eventos.
8. Reintentar una publicacion fallida sin romper la llave de idempotencia.

## 7. Dependencias abiertas
- provisionar Supabase sandbox;
- cargar `.env.local` por canal seguro;
- recibir export real de n8n para la fase de integracion.
