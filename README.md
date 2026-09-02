# Development Wiki V3

Wiki técnica estática basada en Markdown, pensada para centralizar documentación de producto, arquitectura, backlog, QA y decisiones de desarrollo.

## Características

- React + Vite.
- Markdown como fuente de verdad.
- Sin base de datos.
- Índice de navegación generado automáticamente desde `content/`.
- Búsqueda por título, descripción, sección y tags.
- Breadcrumbs.
- Tabla de contenidos automática para `##` y `###`.
- Mermaid mediante bloques ` ```mermaid `.
- Tema claro/oscuro persistente.
- Responsive.
- Frontmatter procesado en Node durante `dev/build`, nunca en el navegador.
- Sin `Buffer`, `fs` ni `gray-matter` en el frontend.

## Arranque

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## MVP multitenant

Requiere Docker. La primera vez ejecuta:

```bash
docker compose up -d
npm install
npx prisma migrate dev
npm run db:seed
npm run dev:all
```

Abre `http://localhost:5173`. Cuentas de prueba (contraseña común `Admin123!`):

- `admin@example.com`: `SUPERADMIN`, acceso a todos los proyectos.
- `editor@example.com`: `EDITOR` del proyecto ServiFix.
- `viewer@example.com`: `VIEWER` del proyecto ServiFix.

El seed crea además un segundo tenant privado para validar que editor y viewer no puedan listar ni consultar sus documentos. Cambia todas las credenciales de seed antes de usar el proyecto fuera de desarrollo.

El MVP incluye cierre de sesión, expiración automática de sesión, editor Markdown, estados de publicación, administración de miembros y creación de proyectos para `SUPERADMIN`. Para ejecutar la prueba de aislamiento y RBAC con la API levantada:

Desde la pantalla de acceso cualquier persona puede crear una cuenta. El registro crea automáticamente una wiki personal y asigna al usuario el rol `ADMIN`. En **Administrar documentos** se puede seleccionar un archivo `.md` de hasta 1.5 MB; su frontmatter básico se carga en el formulario para revisarlo antes de guardarlo.

```bash
npm run test:smoke
```

Los usuarios con más de un proyecto pueden volver al selector desde el icono de proyectos de la cabecera. `SUPERADMIN` dispone además de **Administración global**, desde donde puede cambiar perfiles globales, bloquear usuarios, generar contraseñas temporales y administrar proyectos. Los proyectos admiten modo solo lectura, bloqueo y eliminación lógica reversible; la reactivación conserva miembros y documentos.

## Build de producción

```bash
npm run build
npm run preview
```

## Crear un documento

Guarda un `.md` dentro de `content/`, por ejemplo:

```md
---
title: Arquitectura de autenticación
description: Diseño de autenticación y autorización.
section: Arquitectura
order: 10
tags: [auth, seguridad]
updated: 2026-08-20
---

# Arquitectura de autenticación

## Objetivo

Contenido...
```

Al iniciar o compilar, `scripts/build-content-index.mjs` genera `public/content-index.json` y copia el cuerpo Markdown limpio a `public/content/`.

## Mermaid

````md
```mermaid
flowchart LR
  A[Markdown] --> B[Wiki]
  B --> C[Usuario]
```
````

## Estructura recomendada

```text
content/
├── 00-home/
├── 01-product/
├── 02-functional/
├── 03-architecture/
├── 04-backlog/
├── 05-testing/
└── 06-decisions/
```
