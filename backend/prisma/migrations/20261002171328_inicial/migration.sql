-- CreateEnum
CREATE TYPE "Disponibilidad" AS ENUM ('disponible', 'por_encargo');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'confirmado', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('nuevo', 'presupuestado', 'en_proceso', 'listo', 'entregado', 'cancelado');

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "categoriaId" TEXT NOT NULL,
    "precio" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "disponibilidad" "Disponibilidad" NOT NULL DEFAULT 'disponible',
    "diasConfeccion" INTEGER,
    "fibra" TEXT,
    "talles" TEXT[],
    "colores" TEXT[],
    "cuidados" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FotoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "comentario" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "total" INTEGER NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encargo" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "zona" TEXT,
    "tipoPrenda" TEXT NOT NULL,
    "productoBaseId" TEXT,
    "talle" TEXT,
    "medidas" TEXT,
    "colores" TEXT,
    "fibra" TEXT,
    "fechaDeseada" TIMESTAMP(3),
    "comentario" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'nuevo',
    "presupuesto" INTEGER,
    "fechaEstimada" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arreglo" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "zona" TEXT,
    "tipoPrenda" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'nuevo',
    "presupuesto" INTEGER,
    "fechaEstimada" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arreglo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoSolicitud" (
    "id" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "encargoId" TEXT,
    "arregloId" TEXT,

    CONSTRAINT "FotoSolicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrabajoGaleria" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "ruta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrabajoGaleria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Encargo_numero_key" ON "Encargo"("numero");

-- CreateIndex
CREATE INDEX "Encargo_estado_idx" ON "Encargo"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Arreglo_numero_key" ON "Arreglo"("numero");

-- CreateIndex
CREATE INDEX "Arreglo_estado_idx" ON "Arreglo"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_usuario_key" ON "Admin"("usuario");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoProducto" ADD CONSTRAINT "FotoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encargo" ADD CONSTRAINT "Encargo_productoBaseId_fkey" FOREIGN KEY ("productoBaseId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoSolicitud" ADD CONSTRAINT "FotoSolicitud_encargoId_fkey" FOREIGN KEY ("encargoId") REFERENCES "Encargo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoSolicitud" ADD CONSTRAINT "FotoSolicitud_arregloId_fkey" FOREIGN KEY ("arregloId") REFERENCES "Arreglo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
