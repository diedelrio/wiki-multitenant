# Especificación de Flujos de Pantallas y Experiencia de Usuario (UX/UI): Servi González

## 1. Mapa Global de Navegación y Pantallas

```
                                      MAPA GLOBAL DE NAVEGACIÓN
                                      
                                      ┌──────────────────────┐
                                      │   01. HOME PÚBLICA   │
                                      └──────────┬───────────┘
                 ┌───────────────────────────────┼───────────────────────────────┐
                 ▼                               ▼                               ▼
       [ CATÁLOGOS & GUÍAS ]           [ TRACKING PÚBLICO ]             [ ACCESO & REGISTRO ]
       - 02. Directorio Marcas         - 04. Form Búsqueda              - 05. Login
       - 03. Tutorial Despiece         - 04b. Resguardo Público         - 06. Registro (NIF/CIF)
                                                                        - 07. Recuperar Password
                                                                                 │
                                                                                 ▼
                                                                     [ ÁREA CLIENTE LOGUEADO ]
                                                                     - 09. Dashboard Principal
                                                                     - 10. Wizard Reparación/Piezas
                                                                     - 11. Detalle & Historial
                                                                     - 12. Aprobador Presupuestos
                                                                     - 13. Perfil & Direcciones
```

---

## 2. Portal Público (Sin Autenticación)

### Pantalla 01: Home / Landing Page Principal
- **Cabecera (Sticky Header):**
  - Logotipo institucional de Servi González.
  - Menú de navegación: `Inicio`, `Reparaciones`, `Recambios y Despieces`, `Cómo Funciona`, `Contacto`.
  - Input rápido de consulta por resguardo.
  - Botones de acción de cabecera: `[Iniciar Sesión]` y `[Crear Cuenta]`.
- **Hero Section:**
  - Título de alto impacto: *"Servicio Técnico Oficial y Especialista en Reparación de Maquinaria de Construcción en Valencia"*.
  - Llamada a la acción (CTA) principal: `[Solicitar Reparación / Pedir Recambio]`.
- **Widget de Búsqueda Rápida (Tracking):**
  - Inputs: `Nº de Resguardo` + `Teléfono de Contacto`.
  - Botón: `[Consultar Estado]`.
- **Secciones de Contenido:**
  - Comparativa visual: Flujo *En Garantía Oficial* vs. *Fuera de Garantía*.
  - Marcas oficiales y multimarca (DeWalt, Bosch, Makita, Stanley, Stayer, Milwaukee, etc.).
  - Pasos del proceso: Solicitud online → Logística/Taller → Diagnóstico/Presupuesto → Reparación y Entrega.

---

### Pantalla 02: Directorio de Marcas y Catálogo de Despieces
- **Objetivo:** Facilitar la identificación de repuestos mediante diagramas oficiales (*exploded views*).
- **Componentes:**
  - Buscador predictivo por marca, familia de maquinaria o herramienta.
  - Grid de tarjetas por fabricante con logotipos oficiales.
  - Cada tarjeta incluye:
    - Botón de enlace externo directo al portal oficial de despiece técnico.
    - Botón de acceso directo al formulario de Servi González con la marca preconfigurada.

---

### Pantalla 03: Guía Técnica y Vídeo Tutorial ("Cómo identificar tu recambio")
- **Objetivo:** Prevenir errores en las referencias solicitadas por los clientes.
- **Componentes:**
  - Reproductor de vídeo o infografía interactiva en 4 pasos:
    1. **Paso 1:** Localizar la placa/etiqueta técnica en la carcasa (Modelo, Tipo/Versión y Nº de Serie).
    2. **Paso 2:** Acceder al despiece del fabricante y buscar el número de posición de la pieza.
    3. **Paso 3:** Copiar el código de referencia original (OEM).
    4. **Paso 4:** Pegar la referencia en el formulario de pedido de Servi González.
  - Bloque de advertencia legal (Disclaimer de responsabilidad del pedido bajo demanda).

---

### Pantalla 04: Consulta Rápida de Resguardo (Tracking Público)
- **Entrada:** `Nº de Resguardo (Sage / Web)` + `Teléfono de Contacto`.
- **Resultado (Pantalla 04b - Solo Lectura):**
  - Vista simplificada del estado del equipo mediante un *Stepper* visual:
    - `Solicitud Registrada` → `En Tránsito` → `En Taller / Diagnóstico` → `En Reparación` → `Lista para Entrega / Enviada`.
  - Alerta en caso de presupuesto pendiente con botón para iniciar sesión y aprobarlo.

---

## 3. Módulo de Identidad y Autenticación (Auth)

### Pantalla 05: Inicio de Sesión (Login)
- **Campos del Formulario:**
  - Email / CIF registrado.
  - Contraseña (con alternador para mostrar/ocultar caracteres).
  - Checkbox: *Recordar mi sesión*.
- **Enlaces de Navegación:**
  - `¿Has olvidado tu contraseña?` ➔ Redirección a Pantalla 07.
  - `¿Aún no tienes cuenta? Regístrate` ➔ Redirección a Pantalla 06.
- **Acción:** Botón `[Iniciar Sesión]`.

---

### Pantalla 06: Creación de Cuenta (Registro)
- **Paso 1: Tipo de Cuenta:**
  - Selector: `Particular / Autónomo` | `Empresa / Constructora`.
- **Paso 2: Datos Identificativos y Fiscales:**
  - Nombre y Apellidos o Razón Social.
  - NIF / CIF (con validación de formato legal).
  - Teléfono móvil (para alertas automáticas por SMS/WhatsApp del taller).
  - Correo electrónico principal.
- **Paso 3: Dirección Fiscal / Base:**
  - Dirección completa (Calle, Nº, CP, Población, Provincia).
- **Paso 4: Credenciales y Políticas:**
  - Contraseña segura (mínimo 8 caracteres, mayúscula y número).
  - Confirmación de contraseña.
  - Checkbox obligatorio: Aceptación de Términos y Condiciones y Política de Privacidad (RGPD).
- **Paso 5: Activación:**
  - Envío automático de email de verificación con enlace seguro.

---

### Pantalla 07: Recuperación de Contraseña
- **Paso 1: Solicitud de Restablecimiento:**
  - Input: `Correo Electrónico registrado`.
  - Botón: `[Enviar Enlace de Recuperación]`.
- **Paso 2: Confirmación de Envío:**
  - Mensaje informativo de correo enviado.
- **Paso 3 (Pantalla 08 - Desde Enlace Seguro):**
  - Validación criptográfica del token de recuperación.
  - Inputs: `Nueva Contraseña` + `Repetir Nueva Contraseña`.
  - Botón: `[Actualizar Contraseña e Iniciar Sesión]`.

---

## 4. Área Privada de Clientes (Usuario Autenticado)

```text
ESTRUCTURA DE NAVEGACIÓN PRIVADA:
├── [1] Mi Taller / Dashboard Principal
├── [2] Nueva Solicitud (Wizard Multi-paso)
├── [3] Mis Presupuestos
├── [4] Libreta de Direcciones (Obras / Sedes)
└── [5] Perfil de Empresa / Seguridad
```

---

### Pantalla 09: Dashboard Principal del Cliente
- **Panel de Métricas / Widgets:**
  - Total de máquinas activas en taller.
  - Presupuestos pendientes de aprobación (destacado en color de alerta).
  - Órdenes finalizadas listas para recogida o envío.
- **Tabla de Órdenes y Solicitudes:**
  - Columnas: `Nº Resguardo / Código`, `Fecha`, `Equipo (Marca / Modelo)`, `Tipo`, `Estado Actual`, `Acciones`.
  - Acciones por fila: `[Ver Detalle]`, `[Descargar Resguardo PDF]`, `[Gestionar Presupuesto]`.
- **Botón de Acción Rápida:** `[+ Nueva Solicitud de Reparación / Pieza]`.

---

### Pantalla 10: Wizard de Nueva Solicitud (Paso a Paso)

#### Paso 1: Tipo de Servicio y Cobertura
- Selector de Servicio:
  - `Reparación de Herramienta en Taller`
  - `Pedido Únicamente de Recambio / Pieza`
- Selector de Garantía:
  - `En Garantía Oficial`: Habilita subida de factura/ticket de compra (PDF/JPG) y fecha de factura.
  - `Fuera de Garantía`: Aviso informativo de presupuesto previo tras diagnosis en taller.

#### Paso 2: Ficha del Equipo y Avería
- Marca (selector con autocompletado + opción manual).
- Modelo exacto y Número de Serie.
- Síntomas de la avería (checklist de fallos mecánicos/eléctricos + campo de texto libre).
- Drag & Drop para fotos del equipo y de la placa técnica identificativa.

#### Paso 3: Petición de Piezas y Disclaimer Vinculante (Si aplica)
- Entrada dinámica de filas: `[Referencia Original (OEM)]` + `[Cantidad]` + `[Descripción]`.
- **Checkbox Vinculante Obligatorio (Disclaimer):**
  > *"Declaro haber verificado la referencia solicitada en el despiece oficial. Acepto que, al ser un pedido de pieza específica, no se admiten devoluciones ni cancelaciones por error de referencia imputable al cliente, facturándose el importe íntegro."*

#### Paso 4: Logística y Recogida
- Selector de modalidad:
  - `Entrega presencial en Taller Servi González (Valencia)`.
  - `Recogida por transporte`: Selección de dirección guardada (obra/almacén), persona de contacto, franja horaria (Mañana / Tarde) y número de bultos.

#### Paso 5: Resumen y Generación de Resguardo
- Confirmación final de datos.
- **Pantalla 10b (Confirmación):**
  - Muestra el **Nº de Resguardo generado (Sage 50c)**.
  - Botón de descarga de etiqueta/resguardo en PDF con código QR para pegar en el embalaje.
  - Enlace al seguimiento directo de la orden.

---

### Pantalla 11: Detalle y Seguimiento de Orden Individual
- Ficha técnica completa de la máquina y datos de recogida.
- **Timeline de Trazabilidad:** Histórico con fecha, hora, estado y notas del técnico (ej. *Ingreso en banco de pruebas*, *Pieza pedida a fábrica*, *Reparación completada*).
- **Documentación:** Enlaces de descarga del resguardo, albarán y factura.

---

### Pantalla 12: Módulo de Aprobación de Presupuestos (Fuera de Garantía)
- **Componentes:**
  - Desglose detallado de costes:
    - Líneas de recambios oficiales necesarios.
    - Horas estimadas de mano de obra técnica.
    - Gastos de transporte o diagnosis (si aplica).
    - Subtotal, IVA (21%) y Total.
  - Botón: `[Descargar Presupuesto Oficial en PDF]`.
- **Acciones del Cliente:**
  - **[Aceptar Presupuesto]:** Confirmación con firma digital / checkbox legal. Cambia el estado de la orden automáticamente a `Presupuesto Aceptado / En Reparación`.
  - **[Rechazar Presupuesto]:** Selector de motivo y confirmación del trámite de devolución o cobro de diagnóstico pactado.

---

### Pantalla 13: Libreta de Direcciones y Obras
- Listado de sedes, obras y almacenes de la empresa cliente.
- Botón `[+ Añadir Nueva Dirección]`.
- Gestión de direcciones habituales para agilizar recogidas múltiples.

---

### Pantalla 14: Perfil de Usuario y Preferencias
- Datos fiscales (Razón Social, CIF, Teléfono de contacto, Email de facturación).
- Configuración de seguridad (cambio de contraseña).
- Preferencias de notificación (alertas por Email / SMS).
- Botón de cierre de sesión (`Logout`).
