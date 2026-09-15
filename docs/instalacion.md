# Instalación y mantenimiento de Central WiKi

Referencia del repositorio, versión 0.4.0 · 15 de septiembre de 2026.

## Arquitectura y alcance

- Frontend: React y Vite.
- API: Express y TypeScript, con sesiones mediante cookies.
- Datos: PostgreSQL y Prisma. Los documentos, miembros, solicitudes y preferencias se guardan en la base de datos.
- Manual común: `docs/manual-usuario.md`, incorporado al frontend durante la compilación. No depende de un proyecto ni del seed.

El `docker-compose.yml` actual contiene **solo PostgreSQL**. No hay todavía una configuración Docker completa para frontend y API. `content/` y `public/content-index.json` sirven para importar documentación de ejemplo; no son la fuente de los documentos editados desde la aplicación.

## Requisitos

Esta configuración se ha trabajado con Node.js 24 y PostgreSQL 16. Necesitas Node.js con npm, el repositorio completo y Docker con Compose para usar la base de datos incluida. También puedes usar un PostgreSQL existente y adaptar `DATABASE_URL`.

Ejecuta los comandos desde la raíz del repositorio. Los ejemplos usan PowerShell cuando hay comandos propios del sistema.

## Primera instalación local

1. Instala las dependencias:

```powershell
npm ci
```

2. Copia la configuración **solo si todavía no existe `.env`**:

```powershell
Copy-Item .env.example .env
```

3. Revisa las variables:

| Variable | Uso |
| --- | --- |
| DATABASE_URL | Conexión a PostgreSQL. La configuración local de ejemplo coincide con Compose. |
| PORT | Puerto de la API, normalmente 3000. |
| WEB_ORIGIN | Origen del frontend, por ejemplo `http://localhost:5173`. |
| SESSION_TTL_HOURS | Duración de las sesiones; por defecto, 168 horas. |
| SEED_SUPERADMIN_EMAIL | Cuenta global que crea o actualiza el seed. |
| SEED_SUPERADMIN_PASSWORD | Contraseña utilizada por el seed para las cuentas de ejemplo. |
| NODE_ENV | En producción, usar `production`; activa cookies que requieren HTTPS. |

No publiques `.env`. Antes de exponer la instalación fuera del equipo local, sustituye las credenciales de ejemplo y limita el acceso a PostgreSQL.

4. Levanta la base de datos y aplica las migraciones existentes:

```powershell
docker compose up -d
npx prisma migrate deploy
npm run db:generate
```

5. Para una instalación inicial con usuarios y contenido de ejemplo:

```powershell
npm run content:index
npm run db:seed
```

El seed crea SUPERADMIN y las cuentas `editor@example.com` y `viewer@example.com`, además de los proyectos de demostración. Todas reciben la contraseña configurada en `SEED_SUPERADMIN_PASSWORD`; si no se configura, usa `Admin123!`. También imprime esa contraseña en la terminal: trata esa salida como información privada.

**No ejecutes el seed como parte de cada actualización:** puede restablecer contraseñas, roles y documentos de ejemplo. `content:import` ejecuta este mismo seed. Antes de un uso real, revisa y bloquea o elimina las asignaciones de demostración desde la administración según corresponda.

6. Inicia frontend y API:

```powershell
npm run dev:all
```

Abre `http://localhost:5173`. Mantén el proceso en ejecución. La API responde en `http://localhost:3000/api/health`. El comando `npm run dev` inicia solamente el frontend; `npm run dev:api`, solamente la API.

## Comprobación inicial

1. Inicia sesión con la cuenta SUPERADMIN configurada.
2. Comprueba que puedes abrir Administración de proyectos y Usuarios por proyecto.
3. Crea un proyecto de prueba, registra otra cuenta y solicita acceso.
4. Aprueba la solicitud y verifica que la cuenta accede como VIEWER.
5. Crea un documento **Publicado** y comprueba su lectura desde esa cuenta.
6. Abre Ayuda → Manual de usuario.

## Compilación y publicación

```powershell
npm run build
npm run build:api
```

El frontend se genera en `dist/`; la API, en `server/dist/`. Con `NODE_ENV=production`, la API sirve también el frontend y las rutas de React desde el mismo puerto. Para ejecutarla desde la raíz:

```powershell
$env:NODE_ENV = 'production'
node --env-file=.env server/dist/index.js
```

La publicación requiere HTTPS. Puedes usar la terminación TLS del proveedor o un proxy delante del servicio:

- Dirigir todo el tráfico al puerto de la API. En producción, esta sirve `dist/` y devuelve `index.html` para las rutas de navegación de React.
- Las rutas `/api` conservan sus respuestas JSON; no se convierten en páginas del frontend.
- Usar HTTPS y configurar `WEB_ORIGIN` con la dirección pública real.
- Ejecutar la API mediante un servicio o gestor de procesos y definir `NODE_ENV=production`.
- Mantener PostgreSQL accesible únicamente para los componentes que lo necesitan.

`npm run preview` permite revisar los archivos compilados, pero su configuración actual no incluye el proxy `/api`; no es un despliegue completo. El proxy de desarrollo en `vite.config.js` apunta a `localhost:3000`: si cambias `PORT`, ajusta ese destino.

### Preparación para Render y PostgreSQL externo

Crea un servicio web Node conectado al repositorio, con la raíz del repositorio como directorio de trabajo:

- **Build Command:** `npm ci --include=dev && npm run build:render`
- **Start Command:** `npm run start:render`
- **Health Check Path:** `/api/health`
- **NODE_ENV:** `production`.
- **DATABASE_URL:** conexión de tu PostgreSQL externo, con SSL según la configuración del proveedor.
- **WEB_ORIGIN:** URL HTTPS pública del servicio, sin barra final.
- **SESSION_TTL_HOURS:** duración deseada para las sesiones.

El servicio utiliza el `PORT` que recibe del entorno. El build genera Prisma y compila ambas partes; el arranque aplica las migraciones existentes antes de iniciar el servidor. No ejecuta el seed ni crea cuentas automáticamente. Prepara SUPERADMIN de manera controlada antes de habilitar el uso de la instalación; revisa la sección del seed si necesitas datos de demostración.

El frontend y la API comparten origen, por lo que no necesitas una URL de API adicional en React. Esta configuración prepara el código; no crea servicios, cuentas ni bases de datos en el proveedor.

## Actualizaciones

1. Haz una copia de seguridad y conserva la versión anterior del código.
2. Detén la API antes de regenerar Prisma, especialmente en Windows.
3. Obtén la nueva versión y ejecuta:

```powershell
npm ci
npx prisma migrate deploy
npm run db:generate
npm run build
npm run build:api
```

4. Reinicia la API y publica el nuevo `dist/`.
5. Comprueba acceso, proyectos, documentos y ayuda.

`prisma migrate dev` se reserva para desarrollar nuevas migraciones. En instalaciones existentes se aplican las migraciones incluidas con `migrate deploy`. No uses `db:push` como sustituto habitual de las migraciones versionadas.

## Copias de seguridad

El volumen de Docker conserva PostgreSQL al recrear el contenedor, pero no sustituye una copia externa. No uses `docker compose down -v` si necesitas conservar los datos.

Para la configuración de Compose incluida, crea un respaldo dentro del contenedor y cópialo al equipo. Cambia el nombre del archivo en cada ejecución:

```powershell
docker compose exec -T postgres pg_dump -U wiki -d wiki -Fc -f /tmp/wiki-backup.dump
docker compose cp postgres:/tmp/wiki-backup.dump ./wiki-backup.dump
```

Guarda el archivo fuera del equipo y del repositorio con acceso restringido. Conserva también la configuración necesaria para reconstruir la instalación. La base contiene cuentas, hashes de contraseñas y sesiones: el respaldo es sensible.

Para comprobar la restauración sin reemplazar la base actual, utiliza una base de prueba nueva:

```powershell
docker compose cp ./wiki-backup.dump postgres:/tmp/wiki-restore.dump
docker compose exec -T postgres createdb -U wiki wiki_restore_test
docker compose exec -T postgres pg_restore -U wiki -d wiki_restore_test --no-owner /tmp/wiki-restore.dump
```

Usa otro nombre si esa base ya existe. Verifica la restauración con una instancia de prueba antes de planificar la recuperación de la instalación real. Estos comandos son instrucciones; crear esta guía no ejecuta respaldos ni restauraciones.

## Pruebas disponibles

Con API y base de datos activas:

```powershell
node scripts/test-access-requests.mjs
node scripts/test-project-members.mjs
```

Crean y eliminan datos temporales. La prueba de miembros utiliza la cuenta SUPERADMIN configurada. Preferiblemente ejecútalas contra una instalación de prueba.

`npm run test:smoke` depende de los usuarios, proyectos y asignaciones de demostración originales. Si se eliminaron o modificaron, puede fallar por esos datos ausentes; no vuelvas a ejecutar el seed sobre datos reales solo para satisfacer esa prueba.

## Diagnóstico

| Síntoma | Comprobaciones |
| --- | --- |
| Error de comunicación con la API | Comprueba que la API esté activa, el puerto y el proxy `/api`. |
| API activa pero falla el acceso a datos | Revisa PostgreSQL, `DATABASE_URL` y migraciones. `/api/health` no comprueba la base de datos. |
| Registro devuelve 400 | Lee la validación en el formulario: nombre, email y longitud de contraseña. |
| VIEWER no ve documentos | Comprueba pertenencia al proyecto y estado Publicado. |
| Prisma muestra EPERM al generar | Detén el proceso de la API que mantiene cargado el motor, ejecuta `db:generate` y reinícialo. |
| Vite abre pero el login falla | `npm run dev` no inicia la API. Usa `dev:all` o inicia también `dev:api`. |
| Login en producción no conserva sesión | Comprueba HTTPS, origen público y envío de cookies a través del proxy. |
| El manual no refleja cambios | El Markdown se incorpora durante el build: vuelve a compilar y publicar el frontend. |

## Mantener la documentación

Edita `docs/manual-usuario.md` para cambiar tanto el manual del repositorio como el de la aplicación. No requiere importación a la base de datos. Actualiza también esta guía cuando cambien los comandos, las variables o la arquitectura. Revisa las instrucciones y permisos con cada versión.
