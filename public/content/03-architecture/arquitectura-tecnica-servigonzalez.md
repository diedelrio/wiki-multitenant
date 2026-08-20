# Arquitectura Técnica: Plataforma Web Servi González

## 1. Diagrama de Arquitectura Global

```
                             ┌───────────────────────────────────┐
                             │       Frontend (SPA / SSR)        │
                             │  React 19 / Vite + Tailwind CSS   │
                             └─────────────────┬─────────────────┘
                                               │ HTTPS / REST / WS
                                               ▼
                             ┌───────────────────────────────────┐
                             │        API Backend Gateway        │
                             │   Node.js (v22 LTS) + Express/Nest│
                             └────┬──────────┬──────────────┬────┘
                                  │          │              │
       ┌──────────────────────────┘          │              └──────────────────────────┐
       ▼                                     ▼                                         ▼
┌───────────────┐                  ┌───────────────────┐                     ┌────────────────────┐
│  PostgreSQL   │                  │ Storage (Archivos)│                     │  Sage 50c Adapter  │
│  (Prisma ORM) │                  │ S3 / Cloudinary   │                     │  Worker / Cron     │
└───────────────┘                  └───────────────────┘                     └─────────┬──────────┘
 (Tickets, Users,                   (Facturas garantía,                                │
  Quotes, Logs)                      Fotos de etiquetas)                               ▼
                                                                             ┌────────────────────┐
                                                                             │ Ficheros XML/JSON  │
                                                                             │  o API Conector    │
                                                                             └────────────────────┘
```

---

## 2. Stack Tecnológico

| Capa / Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend** | **React 19 + TypeScript + Tailwind CSS** | Compatibilidad con la maqueta actual en Render (`servigonzalez.onrender.com`), componentes modulares y reactividad para dashboards y wizards. |
| **UI Kit & Formularios** | **shadcn/ui + Lucide Icons + React Hook Form + Zod** | Validación robusta de esquemas (números de serie, referencias OEM, validación condicional de garantías) y formularios tipados paso a paso. |
| **Backend API** | **Node.js (v22 LTS) + Express / Fastify (TypeScript)** | Arquitectura REST desacoplada, ligera y modular con middlewares para JWT, validación Zod en servidor y rate-limiting. |
| **Base de Datos** | **PostgreSQL 16** | Integridad transaccional ACID para órdenes de reparación, soporte de campos JSONB para datos variables de fabricantes y logs de auditoría. |
| **ORM / Data Access** | **Prisma ORM** | Tipado end-to-end garantizado con TypeScript, migraciones declarativas y consultas optimizadas. |
| **Autenticación y Seguridad** | **JWT (JSON Web Tokens) + Bcrypt** | Autenticación stateless con control de acceso basado en roles (`RBAC`: *Client*, *WorkshopAdmin*, *SuperAdmin*). |
| **Almacenamiento de Archivos** | **Cloudinary / AWS S3** | Repositorio seguro para comprobantes de garantía (PDF/JPG) y fotografías de etiquetas técnicas de maquinaria. |
| **Procesamiento Asíncrono** | **BullMQ / Node-Cron + Redis** | Ejecución en segundo plano para generación de PDFs de resguardo, notificaciones por email y sincronización con Sage 50c. |
| **Emails Transaccionales** | **Resend / Nodemailer** | Notificación de confirmación de tickets, alertas de emisión de presupuesto y avisos de cambio de estado de máquina. |

---

## 3. Estructura de Directorios del Proyecto

```text
servigonzalez/
├── apps/
│   ├── client/                    # Frontend SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/            # Componentes shadcn/ui
│   │   │   │   ├── wizard/        # Flujo multi-paso de reparación y recambios
│   │   │   │   ├── brands/        # Directorio de marcas y despieces oficiales
│   │   │   │   └── tracking/      # Widget público de búsqueda por resguardo
│   │   │   ├── pages/
│   │   │   │   ├── auth/          # Login y registro de usuarios/empresas
│   │   │   │   ├── dashboard/     # Área privada de clientes y presupuestos
│   │   │   │   └── admin/         # Backoffice del taller y gestión de tickets
│   │   │   ├── hooks/
│   │   │   └── services/          # Clientes API Axios / Fetch
│   │   └── package.json
│   │
│   └── server/                    # Backend API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/          # Registro, login, emisión de tokens JWT
│       │   │   ├── repairs/       # Ciclo de vida de reparaciones y estados
│       │   │   ├── parts/         # Solicitud de piezas y disclaimer legal
│       │   │   ├── quotes/        # Emisión y aprobación de presupuestos
│       │   │   └── sage/          # Conector y sincronizador con Sage 50c
│       │   ├── services/
│       │   │   ├── storage/       # Adaptador Cloudinary / S3
│       │   │   ├── mailer/        # Servicio de envío de plantillas de email
│       │   │   └── pdf/           # Generación de resguardos imprimibles con QR
│       │   ├── middlewares/       # Auth, roles, validación Zod, rate-limit
│       │   └── prisma/            # Schema, migraciones y seeds
│       └── package.json
└── docker-compose.yml
```

---

## 4. Estrategia de Integración con Sage 50c

### Fase 1: Integración Semi-Automatizada (Add-on Intercambio de Datos)
1. **Generación Saliente (Web → Sage 50c):**
   * Tras registrarse una solicitud, el backend genera un archivo estructurado (`.xml` / `.json` según especificación del Add-on de Sage 50c).
   * Se almacena en la carpeta local o de red configurada para que Sage procese la importación como **Depósito de Reparación** o **Pedido de Venta**.
2. **Generación Entrante (Sage 50c → Web):**
   * Sage 50c genera el fichero de respuesta con el número de documento/resguardo oficial asignado.
   * Un script cron lee el archivo y actualiza el campo `sageDocNumber` en la base de datos de Servi González.

### Fase 2: Conector Online Directo (API / Webhooks)
- Desarrollo de un micro-agente intermedio en Windows ejecutándose en el servidor/equipo donde reside Sage 50c.
- Comunicación bidireccional inmediata mediante Webhooks protegidos por API Key:
  - Creación sincrónica de la orden y obtención instantánea del Nº de Resguardo.
  - Actualización automática de estados de taller hacia el panel del cliente.

---

## 5. Esquema de Base de Datos (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CLIENT
  WORKSHOP_ADMIN
  SUPER_ADMIN
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
  CANCELLED
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  role          Role           @default(CLIENT)
  companyName   String?
  taxId         String?        // NIF / CIF
  phone         String
  addresses     Address[]
  repairs       RepairOrder[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Address {
  id            String         @id @default(uuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  street        String
  city          String
  postalCode    String
  province      String
  isDefault     Boolean        @default(false)
}

model RepairOrder {
  id                 String         @id @default(uuid())
  sageDocNumber      String?        @unique // Número de Resguardo Sage 50c
  trackingCode       String         @unique // Código público de seguimiento (ej. SG-2026-00123)
  userId             String?
  user               User?          @relation(fields: [userId], references: [id])
  orderType          OrderType      @default(REPAIR)
  isWarranty         Boolean        @default(false)
  warrantyDocUrl     String?
  brand              String
  model              String
  serialNumber       String?
  issueDescription   String
  status             OrderStatus    @default(REQUESTED)
  disclaimerAccepted Boolean        @default(false)
  pickupAddress      String?
  pickupSchedule     String?        // MAÑANA | TARDE
  packageCount       Int            @default(1)
  items              RepairItem[]
  quotes             Quote[]
  statusHistory      StatusLog[]
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
}

model RepairItem {
  id              String         @id @default(uuid())
  repairOrderId   String
  repairOrder     RepairOrder    @relation(fields: [repairOrderId], references: [id], onDelete: Cascade)
  partReference   String
  description     String?
  quantity        Int            @default(1)
}

model Quote {
  id              String         @id @default(uuid())
  repairOrderId   String
  repairOrder     RepairOrder    @relation(fields: [repairOrderId], references: [id], onDelete: Cascade)
  laborCost       Decimal        @db.Decimal(10, 2)
  partsCost       Decimal        @db.Decimal(10, 2)
  shippingCost    Decimal        @db.Decimal(10, 2)
  taxAmount       Decimal        @db.Decimal(10, 2)
  totalAmount     Decimal        @db.Decimal(10, 2)
  status          QuoteStatus    @default(PENDING)
  pdfUrl          String?
  rejectionReason String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model StatusLog {
  id              String         @id @default(uuid())
  repairOrderId   String
  repairOrder     RepairOrder    @relation(fields: [repairOrderId], references: [id], onDelete: Cascade)
  status          OrderStatus
  note            String?
  createdAt       DateTime       @default(now())
}
```

---

## 6. Despliegue e Infraestructura (Render / Cloud)

* **Web Service (API & Frontend):** Contenedor Docker desplegado en **Render** con auto-deploy desde la rama principal del repositorio.
* **Base de Datos Gestionada:** Instancia de **PostgreSQL en Render** con backups automatizados diarios.
* **Almacenamiento de Archivos:** Bucket de **AWS S3 / Cloudinary** para gestión de imágenes y PDFs.
* **Variables de Entorno Mínimas (`.env`):**
  ```env
  NODE_ENV=production
  PORT=5000
  DATABASE_URL="postgresql://user:password@hostname:5432/servigonzalez_db?schema=public"
  JWT_SECRET="super_secret_jwt_key_here"
  JWT_EXPIRES_IN="7d"
  CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
  RESEND_API_KEY="re_123456789"
  SAGE_SYNC_DIR="./storage/sage_exchange"
  CLIENT_APP_URL="https://servigonzalez.onrender.com"
  ```
