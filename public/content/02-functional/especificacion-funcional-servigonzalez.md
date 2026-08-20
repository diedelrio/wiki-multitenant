# Especificación Funcional: Plataforma Web Servi González

## 1. Resumen Ejecutivo y Objetivos

El presente documento detalla la especificación funcional y técnica para la evolución de la plataforma web de **Servi González** (actualmente maquetada en `https://servigonzalez.onrender.com/`), empresa especializada en la reparación y venta de recambios para maquinaria y herramienta electroportátil de construcción en Valencia.

### Referencias de Negocio Analizadas:
- **Unión Rohe (`unionrohe.es/reparaciones/`):** Referente para la recogida en obra/taller, diferenciación clara de garantías, condiciones de transporte y captura de datos técnicos.
- **BlackCenter (`blackcenter.net/es/`):** Referente para la consulta de despieces por marca, venta de recambios por referencia original y sistema de seguimiento de estado de reparaciones en tiempo real.
- **Sage 50c (Add-on de Intercambio de Datos):** ERP de gestión empresarial para la facturación, presupuestación y control de resguardos de reparación.

---

## 2. Mapa de Flujos de Negocio

La plataforma canaliza dos modalidades de servicio principales: **Reparación de Maquinaria** y **Petición de Recambios/Piezas**.

```
                           ┌──────────────────────────────────────────────┐
                           │    Portal Web Servi González (Público/Auth)  │
                           └──────────────────────┬───────────────────────┘
                                                  │
                            ¿Tipo de solicitud principal?
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
      [ REPARACIÓN DE MÁQUINA ]                                         [ PEDIDO DE RECAMBIOS ]
                 │                                                                 │
      ¿Garantía Oficial?                                              1. Consulta de Despiece (Marcas)
                 │                                                    2. Código de Referencia Original
     ┌───────────┴───────────┐                                        3. Disclaimer Vinculante Obligatorio
     ▼                       ▼                                        4. Emisión Nº Resguardo / Pedido
[ EN GARANTÍA ]     [ FUERA DE GARANTÍA ]                                          │
- Adjuntar factura   - Recepción en taller                                         ▼
- Nº Serie obligat.  - Diagnóstico técnico                            [ Gestión en Sage 50c ]
- Envío directo      - Presupuesto manual (Pieza + MO)
- Sin presupuesto    - Aprobación Web por Cliente
     │                       │
     └───────────┬───────────┘
                 ▼
      Generación Nº Resguardo (Sage 50c)
                 │
                 ▼
      Logística (Taller / Recogida Transporte)
                 │
                 ▼
      Tracking en Tiempo Real por el Cliente
```

---

## 3. Módulos Funcionales del Sistema

### Módulo 1: Catálogos de Despiece y Guías de Autoayuda
*Objetivo: Minimizar los errores de solicitud de piezas y agilizar la identificación de averías.*

1. **Directorio de Marcas y Despieces:**
   - Listado visual de fabricantes oficiales (DeWalt, Bosch, Makita, Hilti, Stanley, Black & Decker, Stayer, Milwaukee, etc.).
   - Enlaces externos parametrizados hacia los portales oficiales de vistas explotadas (*exploded views* / diagramas técnicos).
2. **Guía Didáctica Interactiva / Vídeo Tutorial ("Cómo pedir tu recambio"):**
   - **Paso 1:** Localización de la placa de características de la herramienta (Modelo, Tipo/Versión y Nº de Serie).
   - **Paso 2:** Acceso al despiece del fabricante y localización del número de posición.
   - **Paso 3:** Obtención del código de referencia original (OEM).
   - **Paso 4:** Introducción del código en el formulario de Servi González.
3. **Cuadro Informativo: Diferencias de Garantía:**
   - Requisitos documentales para garantía oficial (Factura de compra con menos de 2/3 años según legislación vigente, sin signos de manipulación previa indebida).
   - Condiciones de reparación fuera de garantía (costes de diagnosis en caso de rechazo de presupuesto).

---

### Módulo 2: Formulario de Solicitud (Reparaciones y Recambios)

Formulario paso a paso (*Wizard Multi-step*) optimizado para dispositivos móviles y escritorio.

#### Paso 1: Selección de Flujo y Cobertura
- **Tipo de Pedido:** `Reparación de Herramienta` | `Únicamente Recambios/Piezas`.
- **Tipo de Cobertura:**
  - `En Garantía`: Exige subir comprobante (PDF/JPG) y fecha de adquisición.
  - `Fuera de Garantía`: Pasa al flujo de presupuestación previa.

#### Paso 2: Ficha Técnica de la Herramienta
- **Marca:** Selector con autocompletado + opción "Otra".
- **Modelo y Versión/Tipo:** (Ej. *DWE560 Tipo 1*).
- **Número de Serie:** Requerido para contrastar con fabricante/Sage.
- **Descripción de la Avería:** Selector de síntomas (No enciende, chisporroteo, fallo de percusión, pérdida de potencia, rotura de carcasa) y campo abierto.
- **Adjuntos:** Fotos de la máquina y de la etiqueta de homologación.

#### Paso 3: Petición de Piezas y Disclaimer Legal (Si aplica)
- Entrada de una o varias referencias técnicas con cantidades.
- **Disclaimer Legal Obligatorio (Checkbox de aceptación explícita):**
  > **Declaración de Responsabilidad de Pedido de Recambio:**
  > *"Declaro que he verificado la referencia de la pieza solicitada conforme a los despieces oficiales del fabricante. Al tratarse de material suministrado bajo pedido específico, entiendo y acepto que el coste de la pieza y su tramitación serán facturados y cobrados en su totalidad, independientemente de si la pieza solicitada es errónea por mi parte o no solventa la avería de la herramienta. No se admiten devoluciones de recambios encargados por referencia errónea del cliente."*

#### Paso 4: Modalidad de Entrega / Recogida
- `Entrega directa en taller central (Valencia)`.
- `Solicitud de recogida por transporte`: Dirección de recogida, franja horaria preferente (Mañana/Tarde), persona de contacto en obra y número de bultos.

---

### Módulo 3: Área de Clientes y Seguimiento (Tracking)

1. **Gestión de Cuentas:**
   - Registro para Particulares (NIF) y Empresas / Autónomos (CIF y Razón Social).
   - Gestión de múltiples direcciones de recogida (obras, almacenes, sedes).
2. **Dashboard de Estado de Reparaciones:**
   - Estados estandarizados:
     1. `Solicitud Registrada`
     2. `Recogida Solicitada / En Tránsito`
     3. `Recibida en Taller Servi González`
     4. `En Diagnóstico Técnico`
     5. `Presupuesto Emitido (Pendiente Aprobación)`
     6. `Presupuesto Aceptado / En Reparación`
     7. `A la espera de Recambio Oficial`
     8. `Reparada y Comprobada / Lista para Entrega o Envío`
     9. `Cerrada / Facturada`
3. **Portal de Aprobación de Presupuestos Online:**
   - Visualización detallada de mano de obra, recambios empleados, portes e impuestos.
   - Acciones: **[Aceptar y Proceder]** (firma digital / consentimiento web) o **[Rechazar Presupuesto]**.
4. **Buscador Rápido Público (Sin Login):**
   - Acceso instantáneo en cabecera introduciendo **Nº de Resguardo + Teléfono / Email**.

---

### Módulo 4: Gestión de Resguardos e Integración con Sage 50c

El **Número de Resguardo** es el elemento vertebrador que enlaza el paquete físico, la orden de taller y la contabilidad.

#### Matriz de Integración con Sage 50c:

| Característica | Fase 1: Integración Semi-Automatizada (Ficheros) | Fase 2: Integración Online Directa (API / Connector) |
| :--- | :--- | :--- |
| **Mecanismo** | Add-on Oficial de Intercambio de Datos de Sage 50 (archivos estructurados XML / CSV / JSON). | Conector en Node.js comunicando vía API REST / Webhooks o base de datos de Sage 50. |
| **Creación Web → Sage** | La web genera un fichero de exportación con la orden/pedido que se importa en Sage periódicamente. | La web invoca el servicio de Sage en tiempo real y registra el Pedido/Depósito al instante. |
| **Generación de Resguardo** | La web asigna un código provisional (`SG-2026-XXXXX`) que se correlaciona con el número de resguardo generado en Sage. | Sage 50 devuelve de forma sincrónica el `Nº de Resguardo / Albarán de Depósito Oficial`. |
| **Sincronización de Estados**| Carga de archivo de actualización de estados de reparación desde Sage al panel web. | Actualización push mediante Webhooks cuando el técnico cambia el estado en Sage. |

---

### Módulo 5: Backoffice de Gestión (Taller Servi González)

1. **Bandeja de Entrada de Órdenes:**
   - Filtros por estado, tipo de garantía, marca y urgencia.
   - Enlace y edición del Nº de Resguardo asignado por Sage.
   - Impresión de etiquetas con código de barras / QR del resguardo para pegar en la máquina.
2. **Editor de Presupuestos Rápidos:**
   - Formulario para cargar los costes de diagnosis, piezas y horas de trabajo para notificación automática por email/SMS al cliente.
3. **Administrador de Marcas y Enlaces:**
   - Mantenimiento sencillo para dar de alta nuevas marcas y actualizar URLs de despiece.

---

## 4. Arquitectura de Datos Sugerida (PostgreSQL / Prisma)

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  role          UserRole       @default(CLIENT)
  companyName   String?
  taxId         String?        // CIF / NIF
  phone         String
  addresses     Address[]
  repairs       RepairOrder[]
  createdAt     DateTime       @default(now())
}

model RepairOrder {
  id              String         @id @default(uuid())
  sageDocNumber   String?        @unique // Nº Resguardo Sage 50c
  trackingCode    String         @unique // Código de seguimiento web
  userId          String?
  user            User?          @relation(fields: [userId], references: [id])
  isWarranty      Boolean        @default(false)
  warrantyDocUrl  String?
  brand           String
  model           String
  serialNumber    String?
  issueDesc       String
  orderType       OrderType      // REPAIR | SPARE_PARTS_ONLY
  status          OrderStatus    @default(REQUESTED)
  disclaimerAccepted Boolean     @default(false)
  items           RepairItem[]
  quotes          Quote[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model RepairItem {
  id              String         @id @default(uuid())
  repairOrderId   String
  repairOrder     RepairOrder    @relation(fields: [repairOrderId], references: [id])
  partReference   String
  description     String?
  quantity        Int            @default(1)
}

model Quote {
  id              String         @id @default(uuid())
  repairOrderId   String
  repairOrder     RepairOrder    @relation(fields: [repairOrderId], references: [id])
  laborCost       Decimal        @db.Decimal(10, 2)
  partsCost       Decimal        @db.Decimal(10, 2)
  shippingCost    Decimal        @db.Decimal(10, 2)
  totalAmount     Decimal        @db.Decimal(10, 2)
  status          QuoteStatus    @default(PENDING) // PENDING | ACCEPTED | REJECTED
  pdfUrl          String?
  createdAt       DateTime       @default(now())
}

enum OrderType {
  REPAIR
  SPARE_PARTS_ONLY
}

enum OrderStatus {
  REQUESTED
  PICKUP_IN_TRANSIT
  RECEIVED_WORKSHOP
  DIAGNOSING
  QUOTE_PENDING
  QUOTE_ACCEPTED
  WAITING_PARTS
  REPAIRED_READY
  CLOSED
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

---

## 5. Próximos Pasos para la Implementación

1. **Ajustes de UI en la Maqueta (`servigonzalez.onrender.com`):**
   - Incorporar el Wizard de 4 pasos para reparaciones y recambios.
   - Maquetar la página de "Despieces y Recambios" con el selector de marcas.
   - Maquetar la pantalla de "Consulta de Resguardo / Tracking".
2. **Implementación de Lógica Backend:**
   - Configuración de autenticación (JWT/NextAuth), almacenamiento de adjuntos (S3/Cloudinary) y envío de correos transaccionales (Resguardos y Presupuestos).
3. **Mapeo de Formatos de Exportación Sage 50c:**
   - Parametrizar la estructura de salida (XML/CSV) conforme al Add-on de Intercambio de Datos de Sage 50.
