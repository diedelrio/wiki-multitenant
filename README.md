# Central WiKi

Wiki multitenant con React, API Express y PostgreSQL. Incluye documentos Markdown, solicitudes de acceso, roles por proyecto y temas Claro, Oscuro y Sistema.

## Documentación

- [Manual de usuario](docs/manual-usuario.md): registro, proyectos, solicitudes, documentos y administración.
- [Instalación y mantenimiento](docs/instalacion.md): configuración, migraciones, publicación, respaldos y diagnóstico.

El manual está disponible en **Ayuda > Manual de usuario** dentro de la aplicación y desde las pantallas de acceso y registro. Se incluye al compilar el frontend y no depende de un proyecto ni del seed.

## Arranque local

Necesitas Node.js con npm y Docker Compose. Desde la raíz:

```powershell
npm ci
```

Si no existe `.env`, copia `.env.example` y revisa sus valores:

```powershell
Copy-Item .env.example .env
docker compose up -d
npx prisma migrate deploy
npm run db:generate
```

Para cargar usuarios y documentos de demostración en la primera instalación:

```powershell
npm run content:index
npm run db:seed
```

El seed utiliza `SEED_SUPERADMIN_EMAIL` y `SEED_SUPERADMIN_PASSWORD`; también crea cuentas de demostración y puede sobrescribir datos al repetirlo. Consulta la guía antes de usarlo sobre una instalación existente.

```powershell
npm run dev:all
```

Abre `http://localhost:5173`. La API utiliza el puerto 3000. **Compose solo inicia PostgreSQL**; `dev:all` inicia frontend y API.

## Verificación

```powershell
npm run build
npm run build:api
node scripts/test-access-requests.mjs
node scripts/test-project-members.mjs
```

Las pruebas de integración requieren API y base de datos activas y utilizan datos temporales. La prueba de miembros necesita SUPERADMIN. `test:smoke` depende de los datos de demostración originales.

## Publicación

El frontend compilado está en `dist/` y la API en `server/dist/`. Configura un servidor web con HTTPS, rutas de React y proxy `/api`. `npm run preview` no sustituye esa configuración. Consulta la [guía de instalación](docs/instalacion.md).
