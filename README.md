# Punto MISISA

Web de **Punto MISISA**, tejidos 100% artesanales: gorros, chalecos, sweaters, medias y más. Además de las prendas listas, toma **encargos a medida** y hace **arreglos** de tejidos.

No hay pasarela de pago: el sitio registra el pedido y abre WhatsApp con el resumen armado para coordinar el pago y la entrega.

## Qué incluye

- **Catálogo** con filtros por categoría y disponibilidad (lista para entregar o por encargo), ficha de producto con galería, fibra, talles, colores y cuidados.
- **Carrito y pedido** sin cuenta. Las piezas suelen ser únicas: el stock se valida al pedir y se descuenta cuando se confirma.
- **Encargos** y **arreglos** con formulario y hasta 5 fotos (se comprimen en el navegador antes de subirlas).
- **Sobre mí**, galería de trabajos y preguntas frecuentes.
- **Panel** (`/admin`) para la tejedora, pensado para el celular: pedidos, encargos y arreglos con estados, presupuesto y notas.

## Stack

| | |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express 5, TypeScript, Prisma 6, Zod |
| Base de datos | PostgreSQL en Supabase |
| Fotos | Supabase Storage |

## Cómo levantarlo

Requisitos: Node.js 22 o superior y un proyecto de Supabase.

### Backend

```bash
cd backend
cp .env.example .env      # completar las credenciales de Supabase, JWT_SECRET y ADMIN_PASSWORD
npm install
npx prisma migrate dev    # crea las tablas
npm run db:seed           # usuario del panel, categorías y productos de ejemplo
npm run dev               # http://localhost:3000
```

En Supabase Storage hay que crear dos buckets: `productos` (público) y `solicitudes` (privado).

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_WHATSAPP con el número del negocio
npm install
npm run dev               # http://localhost:5173
```

En desarrollo, Vite redirige `/api` al backend en el puerto 3000.

### Verificación

```bash
cd backend && npm test && npm run build
cd frontend && npm run lint && npm run build
```

## Estructura

```
punto-misisa/
├── backend/          API Express + Prisma
├── frontend/         Sitio y panel (React)
├── design-sources/   Logo y fotos originales (no se publican)
└── CLAUDE.md         Detalle de funciones, estados y contrato de la API
```

El contrato completo de la API y las reglas de negocio están en [`CLAUDE.md`](CLAUDE.md).
