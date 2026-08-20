---
title: Cómo usar esta wiki
description: Convenciones simples para organizar y publicar documentación Markdown.
section: Inicio
order: 1
tags: [wiki, markdown]
updated: 2026-08-20
---

# Cómo usar esta wiki

Esta aplicación toma todos los archivos `.md` que guardes dentro de la carpeta `content/` y los publica automáticamente en la navegación.

## Crear un documento

1. Crea un archivo Markdown dentro de una carpeta de `content/`.
2. Agrega metadatos opcionales al inicio.
3. Ejecuta `npm run dev` o `npm run build`.

```md
---
title: Arquitectura de autenticación
description: Decisiones y flujo de autenticación de usuarios.
section: Arquitectura
order: 10
tags: [seguridad, auth]
updated: 2026-08-20
---

# Arquitectura de autenticación

Contenido del documento...
```

## Convención recomendada

Usa prefijos numéricos para controlar el orden general de las carpetas y el campo `order` para ordenar documentos dentro de cada sección.
