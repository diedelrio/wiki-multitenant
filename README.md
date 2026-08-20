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
