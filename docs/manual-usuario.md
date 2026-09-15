# Manual de usuario de Central WiKi

Referencia de la versión 0.4.0 · Actualizado el 15 de septiembre de 2026.

Central WiKi organiza documentación en proyectos. Una cuenta puede acceder a varios proyectos y tener un rol distinto en cada uno. Las opciones visibles dependen de esos permisos.

## 1. Primeros pasos

1. Abre la dirección que te indique el responsable de tu instalación.
2. En la pantalla de acceso, pulsa **Crear una cuenta**.
3. Completa nombre, email y contraseña. El nombre debe tener entre 2 y 80 caracteres; la contraseña, entre 10 y 128. Repite la contraseña.
4. Pulsa **Crear cuenta**. Entrarás con tu cuenta, todavía sin proyectos asignados.
5. En **Mis proyectos → Solicitar acceso a proyectos**, marca uno o varios y pulsa **Solicitar acceso**.
6. Espera la decisión de un administrador. La solicitud no concede acceso inmediato a los documentos.

Para las siguientes visitas, introduce tu email y contraseña en **Iniciar sesión**. Para salir, utiliza el botón **Cerrar sesión** de la cabecera. Si olvidaste tu contraseña, contacta con SUPERADMIN; puede generar una temporal.

## 2. Solicitudes y acceso a proyectos

En **Mis solicitudes de acceso** encontrarás una tarjeta por solicitud pendiente o rechazada.

| Estado o acción | Qué significa |
| --- | --- |
| Pendiente | Un administrador todavía debe revisar el pedido. |
| Rechazada | No fuiste aceptado en ese proyecto; no puedes consultar sus documentos. |
| Actualizar | Consulta de nuevo el estado de tus solicitudes y proyectos. |
| Cancelar pedido | Retira la solicitud y elimina su tarjeta. El proyecto vuelve a estar disponible para solicitar acceso, si sigue habilitado. |
| Volver a solicitar | Reenvía una solicitud rechazada para una nueva revisión. Está deshabilitado mientras ya existe un pedido pendiente. |

Cuando se aprueba una solicitud, el proyecto aparece en **Mis proyectos** con rol VIEWER. Actualiza el estado o vuelve a iniciar sesión para ver los cambios. Pulsa la tarjeta del proyecto para entrar.

Cada proyecto decide por separado: puedes ser aceptado en uno y seguir pendiente o ser rechazado en otro. Un proyecto bloqueado o archivado no está disponible para nuevas solicitudes.

## 3. Elegir el proyecto de inicio

1. Abre **Mis proyectos** desde el icono de proyectos de la cabecera.
2. En **Proyecto de inicio**, selecciona el proyecto que usas habitualmente.
3. Espera el mensaje de preferencia guardada.
4. En tu próximo inicio de sesión entrarás directamente en ese proyecto.

Puedes cambiar la selección cuando quieras. Elige **Mostrar Mis proyectos** para volver al listado al iniciar sesión. La preferencia se guarda en tu cuenta. Si el proyecto se bloquea, se elimina o pierdes acceso, se mostrará el listado en lugar de abrirlo.

## 4. Navegar y consultar documentos

- En escritorio con mouse, la barra lateral aparece reducida a iconos. Pasa el puntero por encima para expandirla; se contrae al retirarlo. También permite navegación con teclado.
- En móvil, abre la barra con el botón de menú y ciérrala con la X o pulsando fuera.
- Dentro del proyecto, los documentos se agrupan por sección. Pulsa un título para leerlo.
- Usa el buscador lateral para encontrar documentos del proyecto actual. Los resultados respetan tus permisos.
- El índice del documento permite saltar entre apartados cuando está disponible. En pantallas pequeñas puede ocultarse.
- El icono de proyectos de la cabecera permite volver a **Mis proyectos**.
- **Ayuda → Manual de usuario** abre esta referencia sin depender de que tengas acceso a un proyecto.

Los documentos pueden contener Markdown, tablas, enlaces, bloques de código y diagramas Mermaid. Importar un archivo `.md` carga su texto: no equivale a subir sus imágenes o archivos enlazados. Esos recursos necesitan una ubicación accesible para quien los consulta.

## 5. Temas Claro, Oscuro y Sistema

El selector de tema está en la cabecera y en las pantallas de acceso y registro.

- **Claro:** superficies claras y texto oscuro.
- **Oscuro:** superficies oscuras y texto claro.
- **Sistema:** sigue la preferencia de apariencia del sistema operativo, incluido Windows.

La selección se conserva en ese navegador. El estilo está inspirado en Windows 11; la aplicación también funciona en otros sistemas con navegador.

## 6. Roles y permisos

| Función | VIEWER | EDITOR | ADMIN del proyecto | SUPERADMIN |
| --- | --- | --- | --- | --- |
| Leer documentos publicados | Sí | Sí | Sí | Sí |
| Leer borradores | No | Sí | Sí | Sí |
| Crear, importar y editar documentos | No | Sí | Sí | Sí |
| Eliminar documentos | No | No | Sí | Sí |
| Asignar miembros y cambiar sus roles | No | No | En sus proyectos | En todos |
| Aprobar o rechazar solicitudes | No | No | En sus proyectos | En todos |
| Crear, bloquear, archivar o borrar proyectos | No | No | No | Sí |
| Administrar cuentas y perfiles globales | No | No | No | Sí |

Los roles ADMIN, EDITOR y VIEWER pertenecen a un proyecto. SUPERADMIN es un perfil global. Los administradores de proyecto no pueden ver a SUPERADMIN en la lista de miembros, asignarlo, cambiar su rol ni quitarlo.

Las restricciones del proyecto también se aplican: **Solo lectura** impide modificar documentos; los proyectos bloqueados o archivados no permiten la lectura habitual. SUPERADMIN puede gestionar sus miembros y solicitudes desde la administración.

## 7. Crear, importar y publicar documentos

Disponible para EDITOR, ADMIN y SUPERADMIN.

### Crear un documento

1. Entra al proyecto y abre **Administrar documentos**.
2. Completa título, identificador o *slug*, sección, descripción y etiquetas.
3. Escribe el contenido en Markdown.
4. Elige el estado y pulsa **Guardar**.

El slug identifica el documento en su dirección. Debe ser único dentro del proyecto; usa palabras separadas por guiones. No se cambia desde el formulario de edición.

### Importar un archivo

1. En **Nuevo documento**, pulsa **Importar archivo .md**.
2. Selecciona un archivo Markdown de hasta 1,5 MB.
3. Revisa los campos y el texto cargado. Se reconocen metadatos iniciales como título, descripción, sección, slug, etiquetas y estado.
4. Selecciona **Publicado** si debe ser visible para VIEWER.
5. Pulsa **Guardar**: seleccionar el archivo por sí solo no guarda el documento.

### Entender los estados

| Estado | Visibilidad |
| --- | --- |
| Borrador | Solo EDITOR, ADMIN y SUPERADMIN. Es el estado inicial habitual. |
| Publicado | Visible también para VIEWER con acceso al proyecto. |
| Archivado | Se excluye de las listas y la lectura habitual. |

La pantalla actual no incluye un listado para recuperar documentos archivados. Consulta con el responsable de la instalación antes de archivar uno que necesites recuperar después.

Para modificar un documento, pulsa **Editar**, realiza los cambios y guarda. **Eliminar** pide confirmación y borra el documento definitivamente; solo ADMIN y SUPERADMIN tienen esa opción.

## 8. Administrar miembros

Abre **Usuarios por proyecto** y selecciona un proyecto. También puedes entrar a **Miembros** desde la barra lateral de una wiki.

1. Para agregar a alguien que ya tiene cuenta, escribe su email, elige VIEWER, EDITOR o ADMIN y pulsa **Agregar**.
2. Para cambiar sus permisos, utiliza el selector de rol junto a su nombre.
3. Para retirar el acceso, pulsa **Quitar** y confirma.

Quitar a un miembro no elimina su cuenta ni sus accesos a otros proyectos. El proyecto debe conservar al menos un ADMIN: antes de quitar o degradar al último, asigna a otro.

## 9. Aprobar o rechazar solicitudes

1. Abre **Solicitudes pendientes** en el menú, o pulsa **Revisar solicitudes** en el popup.
2. Revisa el proyecto, el nombre, el email y la fecha de cada pedido.
3. Pulsa **Aprobar** para conceder acceso como VIEWER, o **Rechazar** para denegarlo.
4. Si necesita editar o administrar, cambia su rol después desde **Usuarios por proyecto**.

Cada ADMIN solo ve las solicitudes de sus proyectos habilitados. SUPERADMIN puede revisar todas. También encontrarás solicitudes al gestionar los miembros de un proyecto.

El popup permanece visible mientras haya pendientes, excepto dentro de **Solicitudes pendientes**. Se actualiza al resolver pedidos, al volver a la ventana y aproximadamente cada 30 segundos. Una solicitud ya resuelta no puede recibir una segunda decisión; si otro administrador la revisó, actualiza el listado.

## 10. Administración global

Opciones exclusivas de SUPERADMIN.

### Usuarios

En **Administración de usuarios** puedes cambiar el perfil global USER/SUPERADMIN, bloquear o desbloquear una cuenta y generar una contraseña temporal con **Blanquear clave**. El bloqueo impide iniciar sesión y cierra sus sesiones. La regeneración de contraseña también cierra las sesiones existentes.

Entrega la contraseña temporal a su destinatario por un canal privado. La aplicación actual no ofrece una pantalla para que el usuario cambie su propia contraseña. Debe conservarse al menos un SUPERADMIN activo.

### Proyectos

Para crear uno, utiliza **Crear proyecto** en la parte superior de **Mis proyectos** o **Administración de proyectos**. Completa nombre, identificador y descripción.

| Acción | Efecto |
| --- | --- |
| Solo lectura / Permitir edición | Deshabilita o habilita las modificaciones de documentos. |
| Bloquear / Desbloquear | Suspende o restablece el acceso habitual al proyecto. |
| Archivar / Reactivar | Retira o recupera el proyecto conservando documentos y miembros. |
| Eliminar definitivamente | Borra proyecto, documentos, membresías y solicitudes. Conserva las cuentas de usuario. |

El borrado definitivo exige escribir exactamente el identificador del proyecto. No puede deshacerse desde la aplicación.

## 11. Problemas frecuentes

| Problema | Qué hacer |
| --- | --- |
| No veo proyectos después del registro | Solicita acceso desde Mis proyectos; la cuenta nueva no tiene asignaciones. |
| Mi solicitud fue aprobada pero no veo el proyecto | Actualiza el estado o inicia sesión nuevamente. Comprueba con el ADMIN que no esté bloqueado o archivado. |
| Soy VIEWER y no veo un documento | Pide al editor que compruebe que esté Publicado. Los borradores no son visibles para VIEWER. |
| No puedo editar | Comprueba tu rol y si el proyecto está en Solo lectura. |
| No puedo quitar un ADMIN | Puede ser el último ADMIN o tratarse de un SUPERADMIN protegido. |
| Falló el registro | Lee el mensaje del formulario; verifica email, nombre, longitud de contraseña y que ambas contraseñas coincidan. |
| No se puede contactar con la API | Contacta al responsable de la instalación; debe comprobar API, base de datos y configuración del proxy. |
| El tema no coincide con Windows | Selecciona Sistema. Claro y Oscuro son elecciones manuales. |
| El popup desapareció en Solicitudes pendientes | Es el comportamiento previsto para que puedas revisar los pedidos sin el aviso encima. |

Al informar un problema, indica la pantalla, los pasos, tu rol y el mensaje exacto. No compartas contraseñas ni cookies de sesión.
