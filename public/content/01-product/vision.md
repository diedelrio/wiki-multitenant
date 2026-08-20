
# Visión del producto: ServiFix

**ServiFix** es la plataforma digital de gestión integral de reparaciones, pedidos de recambios técnicos y seguimiento de maquinaria para **Servi González**, servicio técnico especializado en maquinaria para la construcción y herramientas electroportátiles en Valencia.

---

## 🎯 Propósito y Oportunidad

Transformar la operativa tradicional de taller en un ecosistema digital ágil y transparente que conecte a clientes particulares, empresas constructoras y técnicos de taller. El sistema elimina fricciones administrativas en la gestión de garantías oficiales, reduce drásticamente los errores en el pedido de recambios bajo demanda y proporciona trazabilidad de extremo a extremo integrada con el ERP de gestión contable (Sage 50c).

---

## 🚀 Objetivos Estratégicos

1. **Digitalizar el Ciclo de Reparación:** Permitir la entrada de solicitudes vía web 24/7 diferenciando automáticamente los flujos de *Garantía Oficial* (con subida de factura) y *Fuera de Garantía* (con diagnosis y presupuesto online).
2. **Blindar el Suministro de Recambios OEM:** Facilitar el acceso a despieces oficiales por marca y establecer un marco de responsabilidad vinculante (*disclaimer legal*) para evitar devoluciones por referencias solicitadas erróneamente por el cliente.
3. **Transparencia y Trazabilidad en Tiempo Real:** Proveer un número de resguardo único y un portal de seguimiento accesible con y sin autenticación (*tracking express*).
4. **Agilidad en la Aprobación de Presupuestos:** Reducir los tiempos de espera de taller mediante emisión, notificación (email/SMS) y aprobación/rechazo digital de presupuestos con un solo clic.
5. **Integración con Sage 50c:** Conectar la captación web con el ERP para automatizar la generación de resguardos, órdenes de depósito y facturación.

---

## 🧭 Principios Rectores del Producto

- **Certeza Operativa y Jurídica:** Claridad contractual en la solicitud de recambios y verificación documental estricta de garantías para proteger la rentabilidad del taller.
- **Simplicidad Orientada a Obra (Mobile First):** Formularios paso a paso (*wizards*) rápidos e intuitivos para que un jefe de obra o particular pueda registrar una avería desde su teléfono en menos de 2 minutos.
- **Transparencia en Trazabilidad:** Cada cambio de estado físico de la máquina en taller debe reflejarse en tiempo real en la línea de vida digital del cliente.
- **Desacoplamiento y Escalabilidad Técnica:** Arquitectura moderna (React 19 + Node.js + PostgreSQL/Prisma) diseñada para evolucionar desde una integración por ficheros estructurados hasta una conexión en tiempo real vía Webhooks con Sage 50c.
- **Documentación Viva (Docs-as-Code):** Todo el conocimiento funcional, técnico y de producto reside versionado en Markdown dentro del repositorio.

---

## 👥 Segmentos de Usuario

* **Empresas Constructoras y Autónomos:** Requieren agilidad, gestión de múltiples direcciones de obra, facturación con CIF y aprobación rápida de presupuestos para no detener sus trabajos.
* **Clientes Particulares:** Buscan reparación oficial de herramientas de bricolaje/jardín con claridad en precios y validación de garantía.
* **Equipo Técnico y Administrativo de Servi González:** Necesitan un backoffice centralizado para asignar resguardos, registrar diagnósticos, emitir presupuestos y despachar máquinas reparadas.
