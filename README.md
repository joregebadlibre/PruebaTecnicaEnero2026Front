# Prueba Técnica - Frontend (Banco)

Frontend en **Angular 21** para la Prueba Técnica.

## Estructura del repositorio

- `banco-front/`: aplicación Angular (frontend).
- `openapi.yaml`: contrato de la API (OpenAPI 3.0).
- `front.png`: referencia visual del layout.

## Pruebas Unitarias

- `banco-front/src/app/app.spec.ts`
- `banco-front/src/app/core/api/accounts-api.service.spec.ts`
- `banco-front/src/app/core/api/api-error.interceptor.spec.ts`
- `banco-front/src/app/core/api/api-error.spec.ts`
- `banco-front/src/app/core/api/customers-api.service.spec.ts`
- `banco-front/src/app/core/api/reports-api.service.spec.ts`
- `banco-front/src/app/core/api/transactions-api.service.spec.ts`
- `banco-front/src/app/layout/shell.component.spec.ts`
- `banco-front/src/app/pages/accounts/accounts-page.component.spec.ts`
- `banco-front/src/app/pages/customers/customers-page.component.spec.ts`
- `banco-front/src/app/pages/reports/reports-page.component.spec.ts`
- `banco-front/src/app/pages/transactions/transactions-page.component.spec.ts`

## Requisitos

- Node.js + npm (el proyecto declara `npm@10.9.3`).
- API backend corriendo en `http://localhost:8080` (ver `openapi.yaml`).

## Instalación

Desde la carpeta `banco-front/`:

```bash
npm install
```

## Ejecución (desarrollo)

Desde `banco-front/`:

```bash
npm start
```

La app queda disponible en `http://localhost:4200/`.

## Tests

Este proyecto usa **Jest** (no Karma).

Desde `banco-front/`:

```bash
npm test
```

Otros scripts:

```bash
npm run test:watch
npm run test:coverage
```

## Contrato de API

El contrato oficial está en `openapi.yaml`.

Endpoints principales:

- `GET/POST /customers`
- `GET/PUT/DELETE /customers/{id}`
- `PATCH /customers/{id}/status?active=true|false`
- `GET/POST /accounts`
- `GET/PUT/DELETE /accounts/{id}`
- `GET/POST /transactions`
- `GET/PUT/DELETE /transactions/{id}`
- `GET /reports?customerId=...&from=YYYY-MM-DD&to=YYYY-MM-DD` (retorna JSON y PDF en base64)

Servidor base:

- `http://localhost:8080`

## Alcance funcional (UI)

- CRUD de:
  - Clientes
  - Cuentas
  - Movimientos
- Vista de Reportes:
  - Visualización de movimientos
  - Descarga de PDF
- Búsqueda rápida en tablas.
- Mensajes de validación visibles en pantalla.
