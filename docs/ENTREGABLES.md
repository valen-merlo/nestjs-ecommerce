# Documentación del Challenge (Entregables)

Documentación que solicita el punto 6 del Challenge Sr Fullstack: problemas detectados, eventos implementados y por qué, decisiones técnicas y cómo levantar el proyecto. Todo en este único archivo dentro de `docs/`.

---

## 1. Problemas detectados en el diseño original

### Arquitectura y diseño

- **Acoplamiento directo entre módulos**: El sistema original no exponía un flujo event-driven. Cualquier reacción ante acciones de dominio (ej. “producto creado”) requeriría que el módulo de producto conociera e invocara directamente a otros módulos (actividad, notificaciones, inventario), generando acoplamiento y dificultando la evolución a microservicios.
- **Falta de eventos de dominio**: No existía un bus de eventos ni eventos explícitos; por tanto, no había puntos naturales para desacoplar comportamientos secundarios (auditoría, actividad, índices) del flujo principal.

### Implementación y configuración

- **Variables de entorno**: La aplicación depende de variables bien definidas (DB, JWT, etc.). Se verificó que existan `.env.example` y documentación para copiar y configurar el `.env` correctamente.
- **Rutas y autenticación**: Se revisó que las rutas sensibles estén protegidas con guards (JWT, roles) y que el manejo de errores (filtros globales) devuelva respuestas consistentes para el frontend.
- **Respuesta de la API**: Se utiliza un interceptor global que envuelve todas las respuestas en `{ isSuccess, message, data, errorCode, errors }`, de modo que el frontend pueda tratar errores y datos de forma uniforme.

### Base de datos y entidades

- **Migraciones y seed**: El proyecto incluye migraciones TypeORM e historial en `database/migration/history`. El seed crea roles, categorías y usuario admin para poder probar sin datos previos.
- **Inventario**: Existía entidad `Inventory` y tabla en migraciones, pero no había módulo de API ni flujo de eventos asociado; se integró mediante un consumidor de eventos (ver siguiente sección).

---

## 2. Qué eventos se implementaron y por qué

Se implementaron **dos eventos de dominio**:

| Evento | Cuándo se emite | Por qué |
|--------|------------------|--------|
| **`product.created`** | Tras crear y persistir un producto en el backend. | Permite reaccionar de forma desacoplada: registrar actividad, auditoría, índices, etc., sin que el módulo de producto conozca a esos consumidores. |
| **`product.activated`** | Tras activar un producto (cuando cumple validaciones). | Punto natural para integrar inventario (crear variación e inventario inicial) y registrar actividad, sin acoplar Product a Inventory. |

**Event bus**: Se implementó un `EventBusService` (sobre `EventEmitter` de Node) para que los módulos emitan eventos sin conocer a los consumidores.

**Consumidores desacoplados:**

- **ProductCreatedHandler** y **ProductActivatedHandler**: reaccionan con log/auditoría.
- **ActivityRecorderService**: escucha ambos eventos y persiste en la tabla `activity_log` (PostgreSQL) para exponer “Actividad reciente” al frontend (hasta 100 acciones, persisten al reiniciar).
- **ProductActivatedInventoryHandler**: escucha `product.activated` y crea una variación por defecto (talla/color NA) y una fila de inventario inicial (país por defecto, cantidad 0), integrando el dominio de inventario de forma event-driven sin acoplar Product a Inventory.

**Sin comunicación directa**: `ProductService` no importa ni llama a `ActivityService` ni a los handlers; solo emite al bus. La actividad e inventario se actualizan de forma asincrónica vía eventos.

---

## 3. Decisiones técnicas relevantes

| Decisión | Justificación |
|----------|----------------|
| Bus con `EventEmitter` (in-process) | Mínima complejidad, sin infraestructura adicional; adecuado para un monolito y para demostrar el patrón event-driven. Permite más adelante sustituirlo por RabbitMQ/Kafka con cambios acotados. |
| Eventos después de persistir | Se emite tras `save`/`update` para no exponer estado inconsistente a los consumidores. |
| Actividad en BD (tabla `activity_log`) | Persistencia en PostgreSQL; últimas 100 acciones; sobrevive a reinicios del backend. |
| Polling en el frontend | Implementación simple que cumple “reflejar cambios derivados de flujos asincrónicos”; SSE/WebSockets serían una mejora posterior. |
| Handlers con try/catch | Evita que un consumidor fallido propague excepciones al emisor o a otros listeners. |
| Tipado evento → payload | Mejora mantenibilidad y seguridad de tipos al añadir nuevos eventos. |
| Sin refactor total | No se reescribió la estructura de módulos existente (Auth, User, Role, Product); no se introdujo mensajería externa en esta fase. |

---

## 4. Cómo levantar el proyecto

### Requisitos

- Node.js (recomendado LTS)
- PostgreSQL (Docker o instalado localmente)

### Base de datos

**Con Docker:**

```bash
cd nestjs-ecommerce
docker compose up -d
```

**Sin Docker:** Instalar PostgreSQL, crear una base de datos llamada `ecommercedb` (pgAdmin o psql) y configurar en el `.env` (ver abajo) `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`.

### Backend

```bash
cd nestjs-ecommerce
npm install
cp src/common/envs/.env.example src/common/envs/.env
```

Editar `src/common/envs/.env` con los datos de PostgreSQL (y opcionalmente `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

```bash
npm run migration:run
npm run seed:run
npm run start:dev
```

El backend queda en **http://localhost:3000**. El seed crea un usuario admin (por defecto `admin@admin.com` / `12345678`).

### Frontend

En otra terminal:

```bash
cd nestjs-ecommerce/frontend
npm install
npm run dev
```

Abrir **http://localhost:5173**. El frontend hace proxy de `/api` al backend. Para producción, configurar `VITE_API_BASE_URL` con la URL del backend.

### Validación rápida

1. Abrir http://localhost:5173 → sin sesión se muestra la pantalla “Debes iniciar sesión” (no se ve catálogo ni actividad).
2. Iniciar sesión con `admin@admin.com` / `12345678` → se ve el catálogo, “Actividad reciente”, y los botones para crear producto/categoría y activar/desactivar.
3. Crear un producto desde el formulario o por API; en “Actividad reciente” debe aparecer el evento.
4. Activar/desactivar un producto; debe reflejarse en el feed de actividad.

### Usuarios y roles

- **Sin sesión**: Solo se muestra la pantalla “Debes iniciar sesión” (y las páginas Login/Registro). No se accede al catálogo ni a la actividad hasta iniciar sesión.
- **Admin o Merchant**: Acceso completo: listado de productos, detalle, “Actividad reciente”, crear productos y categorías, activar/desactivar productos.
- **Customer**: Solo puede ver el listado de productos y el detalle de cada producto. No ve “Actividad reciente” ni los formularios de crear producto/categoría ni los botones de activar/desactivar.

Se puede **registrar un usuario nuevo** desde el frontend (“Registrarse”). Ese usuario tendrá rol **Customer**. Para probar la creación de productos, categorías, actividad y activación/desactivación hay que usar el usuario admin del seed (`admin@admin.com` / `12345678`).

### Sin Docker (PostgreSQL en Windows)

Instalar PostgreSQL, crear base de datos `ecommercedb` (pgAdmin o psql). En `src/common/envs/.env` configurar `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`.

### Notas

- **Productos**: Se guardan en PostgreSQL (tabla `product`). El seed inserta datos de ejemplo; en runtime todo viene de la BD. Sin seed, el catálogo puede estar vacío hasta crear productos por API o desde el front.
- **Actividad reciente**: Se persiste en la tabla `activity_log`. Ejecutar `npm run migration:run` para crearla; el frontend muestra hasta las últimas 100 acciones.
- **Campo "About"**: En crear producto son puntos destacados (ej. "8 GB RAM"); el backend exige al menos uno para activar el producto. Varios separados por coma.
- **Categorías**: El seed crea dos (Computers, Fashion). Como Admin puedes crear más desde el front (“Crear categoría”). Sin sesión Admin, solo se listan las existentes.
- **Acceso por sesión**: Sin sesión no se muestra catálogo ni actividad (solo la pantalla “Debes iniciar sesión”). Con sesión: Admin/Merchant ven todo (catálogo, actividad, crear producto/categoría, activar/desactivar); Customer solo ve listado y detalle de productos.

---

## 5. URLs públicas de acceso

- **Backend:** https://ecommerce-backend-dl7d.onrender.com
- **Frontend:** https://ecommerce-frontend-ovz4.onrender.com
- **Base de datos:** Gestionada en Render (PostgreSQL Free Tier)

---

## 6. Enlace del repositorio

**Repositorio:** https://github.com/valen-merlo/nestjs-ecommerce

---

