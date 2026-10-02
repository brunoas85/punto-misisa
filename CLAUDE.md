# Punto MISISA — Web de tejidos 100% hechos a mano

Sitio web de **Punto MISISA**, la marca de una tejedora artesanal (MISISA es su nombre artístico), que confecciona prendas 100% a mano: **gorros, chalecos, sweaters, medias** y otras confecciones (bufandas, cuellos, guantes, mantas, ropa de bebé, etc.). No tiene local físico: el sitio funciona como **vidriera + canal de pedidos**, y el pago y la entrega se coordinan por WhatsApp.

El negocio tiene tres líneas de trabajo, y el sitio las refleja:

1. **Prendas disponibles** (stock): piezas ya tejidas, listas para entregar.
2. **Encargos**: prendas a medida o por pedido (elegir modelo, talle/medidas, colores y fibra).
3. **Arreglos**: reparación y ajuste de tejidos (zurcidos, agujeros, cambiar puños, achicar/agrandar, etc.).

## 🚀 Funciones clave

### 1. Catálogo

- **Categorías**: gorros, chalecos, sweaters, medias y "otras confecciones" (se administran desde el panel, no están hardcodeadas).
- **Listado**: foto principal, nombre, categoría, precio (o "a consultar") y disponibilidad: `disponible` (en stock) o `por_encargo` (se teje a pedido, con demora estimada en días).
- **Ficha de producto**: galería de fotos, descripción, fibra/material (lana de oveja, merino, alpaca, acrílico, algodón…), talles o medidas, colores disponibles, cuidados de lavado y tiempo de confección estimado si es por encargo.
- Filtros simples por categoría y por disponibilidad.

### 2. Pedido de prendas en stock

- Carrito simple (agregar/quitar, cantidad, subtotal). Cada pieza en stock suele ser **única** (stock = 1), así que no se puede agregar más de lo disponible.
- Checkout liviano **sin cuenta ni login**: nombre, teléfono/WhatsApp, zona/dirección y comentario.
- Al confirmar se crea el pedido en el backend (estado `pendiente`) y se abre un link `wa.me` con el resumen prellenado para coordinar pago y entrega.
- Estados: `pendiente` → `confirmado` → `entregado` (o `cancelado`). El stock se descuenta al confirmar.

### 3. Encargos (a medida)

- Formulario: tipo de prenda (o "basado en" un producto del catálogo), talle o medidas, colores, fibra preferida, fecha deseada, comentarios y **fotos de referencia** opcionales.
- Se crea una solicitud de encargo y se abre WhatsApp con el resumen.
- Estados: `nuevo` → `presupuestado` → `en_proceso` → `listo` → `entregado` (o `cancelado`). La tejedora carga el presupuesto (precio y fecha estimada) desde el panel.

### 4. Arreglos

- Formulario: tipo de prenda, qué hay que arreglar, **fotos del daño** (muy recomendadas) y datos de contacto.
- Mismo flujo y estados que los encargos.

### 5. Contenido institucional

- **Sobre mí**: la historia de la tejedora, el proceso artesanal, de dónde salen las lanas.
- **Galería de trabajos realizados**: encargos y arreglos terminados (prueba social).
- **Preguntas frecuentes**: tiempos de confección, cuidados de las prendas, envíos, formas de pago.
- Botón flotante de WhatsApp en todo el sitio.

### 6. Panel de administración (solo la tejedora)

- Login simple (usuario/contraseña).
- ABM de productos y categorías: fotos, precio, stock, disponibilidad, visible/oculto.
- Bandeja de **pedidos**, **encargos** y **arreglos** con cambio de estado, presupuesto y notas internas.
- Pensado para usarse **desde el celular** por alguien que no es técnica: formularios cortos, textos claros, botones grandes, cero jerga.

## 🎨 Identidad visual

- Estética **cálida, artesanal y cercana**: tonos de lana natural y tierra (crudo, beige, terracota, mostaza, verde oliva), texturas suaves, fotografía de las prendas como protagonista.
- Tipografía: una serif amable para títulos y una sans legible para el cuerpo (a definir), cargadas desde Google Fonts.
- `design-sources/`: originales provistos por el negocio (logo, fotos de prendas y de la tejedora). Los assets procesados (recortados, comprimidos, WebP) van a `frontend/public/brand/`; las fotos del catálogo, a Supabase Storage.
- **Marca**: "Punto MISISA" (juego entre el punto del tejido y un lugar de encuentro), con la bajada "Tejidos artesanales". Logo **pendiente**.

## 🛠️ Stack tecnológico

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4 (`@tailwindcss/vite`, paleta en el bloque `@theme` de `src/index.css`). React Router. Mobile-first.
- **Backend**: Node.js + Express + TypeScript, Prisma como ORM, validación de entrada con Zod, subida de archivos con Multer.
- **Base de datos**: PostgreSQL en **Supabase** (plan free). Prisma usa `DATABASE_URL` (pooler, puerto 6543) en runtime y `DIRECT_URL` (puerto 5432) para migraciones.
- **Imágenes**: Supabase Storage — bucket público `productos` (catálogo y galería) y bucket privado `solicitudes` (fotos de encargos/arreglos, servidas con URL firmada solo al panel). En Postgres se guardan rutas, nunca binarios.
- **Autenticación**: solo para el panel (JWT, usuario de la tejedora). El cliente final no se autentica.
- **WhatsApp**: sin API oficial — link `https://wa.me/<numero>?text=<resumen>` armado en el frontend.
- **Moneda**: pesos argentinos, guardados como enteros. Se muestran con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })`.

## 📁 Estructura del repo

```
punto-misisa/
├── frontend/         # Sitio web (Vite + React + TypeScript + Tailwind)
├── backend/          # API Express (TypeScript + Prisma + PostgreSQL)
├── design-sources/   # Originales de marca y fotos (no se publican)
└── CLAUDE.md
```

### Cómo levantarlo

```bash
# Backend (desde backend/) — copiar .env.example a .env y completarlo
npm install
npx prisma migrate dev       # crea/aplica migraciones (usa DIRECT_URL)
npm run db:seed              # usuario del panel (ADMIN_USUARIO/ADMIN_PASSWORD), categorías y 2 productos de ejemplo
npm run dev                  # http://localhost:3000
npm test                     # vitest
npm run build                # typecheck + compilación a dist/

# Frontend (desde frontend/) — opcional: .env con VITE_WHATSAPP
npm install
npm run dev                  # http://localhost:5173 (proxy /api -> :3000)
npm run lint && npm run build
```

En Supabase hay que crear a mano los buckets de Storage: `productos` (público) y `solicitudes` (privado). Sin `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, todo funciona salvo la subida de fotos (responde 503).

### Supabase

- Proyecto **Punto MISISA**, ref `tndpyjkacvnwfgbvgsbf`, región `sa-east-1`, org bRuno`s (plan free). Buckets `productos` y `solicitudes` ya creados (8 MB, solo JPG/PNG/WebP).
- `SUPABASE_SERVICE_ROLE_KEY` tiene que ser la clave **legacy `service_role` (JWT)**: la nueva `sb_secret_…` la rechaza Storage con "Invalid Compact JWS".
- **RLS activado en todas las tablas, sin políticas** (migración `activar_rls`): Supabase expone `public` por su API REST y la anon key no es secreta. El backend entra como `postgres` y no pasa por RLS. Toda tabla nueva necesita su `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en la migración que la crea. `_prisma_migrations` se activó a mano (no puede ir en una migración porque no existe en la shadow DB).

### Mapa del código

- `backend/src/app.ts`: monta los routers. `routes/publico/*` (catálogo, galería, pedidos, encargos, arreglos) y `routes/admin/*` (login, ABM de catálogo/galería, bandejas).
- `backend/src/services/`: lógica de negocio. `estados.ts` (transiciones válidas, con tests), `pedidos.ts` (stock: se valida al crear y se descuenta al confirmar, en transacción), `solicitudes.ts` (encargos/arreglos con fotos privadas y URLs firmadas), `presentacion.ts` (forma pública de los productos).
- `backend/src/schemas.ts`: todas las validaciones Zod, con mensajes en español.
- `frontend/src/api/`: cliente HTTP (`client.ts`) y funciones tipadas por endpoint. `types.ts` es espejo del contrato.
- `frontend/src/pages/`: una página por ruta; `pages/admin/` es el panel (`/admin`, protegido por `AdminLayout`).
- `frontend/src/lib/whatsapp.ts`: arma los links y mensajes `wa.me`. `lib/imagenes.ts` comprime fotos antes de subirlas.

### Estado del esqueleto (2026-10-02)

Funciona de punta a punta (falta probarlo contra una base real): catálogo con filtros, ficha, carrito + pedido → WhatsApp, formularios de encargo y arreglo con fotos, login y bandejas del panel con cambio de estado/presupuesto/notas. **Pendiente en el panel**: formulario de alta/edición de productos con subida de fotos, ver las fotos de encargos/arreglos, ABM de categorías y galería (la API ya existe para todo eso).

## 🔌 Contrato de API (borrador)

Prefijo `/api`. Las rutas `/api/admin/*` (salvo login) requieren `Authorization: Bearer <token>`. Errores en español con forma `{ "error": string }`.

| Método | Ruta | Notas |
|---|---|---|
| `GET` | `/api/categorias` | Categorías visibles |
| `GET` | `/api/productos?categoria=&disponibilidad=` | Listado público (solo visibles) |
| `GET` | `/api/productos/:slug` | Ficha de producto |
| `POST` | `/api/pedidos` | `{cliente:{nombre, telefono, zona, comentario?}, items:[{productoId, cantidad}]}` — valida stock. Devuelve el pedido con su número |
| `POST` | `/api/encargos` | Multipart: datos del encargo + hasta 5 fotos opcionales |
| `POST` | `/api/arreglos` | Multipart: datos del arreglo + hasta 5 fotos |
| `GET` | `/api/galeria` | Trabajos realizados |
| `GET` | `/api/health` | Sin auth |
| `POST` | `/api/admin/login` | `{usuario, password}` → `{token}` |
| `GET/POST/PUT/DELETE` | `/api/admin/productos`, `/api/admin/categorias`, `/api/admin/galeria` | ABM |
| `GET` / `PATCH` | `/api/admin/pedidos`, `/api/admin/encargos`, `/api/admin/arreglos` | Listado con filtro por estado; `PATCH /:id` para estado, presupuesto, fecha estimada y notas |

## 🤖 Agentes del proyecto

Dos subagentes en `.claude/agents/`:

- **`frontend`**: todo lo que está en `frontend/` — catálogo, ficha, carrito, formularios de encargo y arreglo, páginas institucionales, link de WhatsApp y pantallas del panel.
- **`backend`**: todo lo que está en `backend/` — esquema Prisma, API Express, stock, pedidos/encargos/arreglos, subida de fotos a Storage y auth del panel.

### Protocolo de integración

1. **Contratos primero**: cualquier cambio de API se refleja en la tabla de arriba antes de codificarlo.
2. **Mocking**: el frontend puede simular respuestas respetando el contrato mientras el backend implementa.
3. **CORS**: el backend permite `http://localhost:5173`; en desarrollo el proxy de Vite lo evita igual.

## Convenciones

- Textos para el usuario en **español rioplatense con voseo** ("elegí", "contanos qué necesitás", "mandanos una foto").
- Nombres del dominio en español (`Producto`, `Categoria`, `Pedido`, `Encargo`, `Arreglo`); lo genérico/técnico en inglés.
- Nunca commitear `.env` ni credenciales de Supabase.

## 🗺️ Pendientes / a definir con la clienta

- Logo, número de WhatsApp, zona de entregas y costo de envío.
- Lista inicial de productos con fotos, precios y fibras.
- Si los encargos/arreglos muestran precio "desde $X" o siempre "a consultar".
- Hosting (sugerido: frontend en Vercel, backend en Render, base y storage en Supabase).
