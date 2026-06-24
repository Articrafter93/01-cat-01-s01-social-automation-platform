# CLASIFICACION-ACTIVO

```yaml
categoria_activo_primaria: "01-Automatizaciones-operativas"
categorias_activo_secundarias:
  - "04-Aplicaciones-web-empresariales"
  - "05-Integraciones-APIs"
  - "13-Low-code-no-code-apps-internas"
superficies_detectadas:
  - "ui_web"
  - "api"
  - "auth"
  - "db"
  - "automation"
  - "observability"
  - "security_sensitive"
  - "low_code"
confianza_clasificacion: "alta"
evidencia_clasificacion:
  - "BRIEF.md"
  - "README.md"
  - "00-ARQUITECTURA-PROYECTO.md"
  - "package.json"
  - "src/app/api/publications/route.ts"
  - "src/server/services/publications-service.ts"
revision_final_perfiles_requeridos:
  - "core"
  - "01"
  - "04"
  - "05"
  - "13"
estado_clasificacion: "final"
tipo_cliente: "ficticio"
```

## Justificacion
- La categoria primaria es `01` porque el valor central es la orquestacion editorial y la ejecucion controlada de flujos entre sistemas y personas.
- La categoria `04` aplica por la presencia de dashboard, bandejas, detalle operativo y control de sesion.
- La categoria `05` aplica por las rutas API, contratos de publicacion, idempotencia y futura integracion con n8n/redes.
- La categoria `13` aplica porque `n8n` sigue siendo una pieza low-code del sistema operativo del flujo.

## Riesgos dominantes
- Duplicidad de publicacion entre canales.
- Acciones sensibles sin RBAC efectivo.
- Falta de sandbox real para validar persistencia, observabilidad y retry.
- Deriva entre app, SQL y workflow real de n8n hasta recibir el export productivo.
