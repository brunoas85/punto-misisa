import { Router } from "express";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { filtrosProductos } from "../../schemas.js";
import { productoPublico, trabajoPublico } from "../../services/presentacion.js";

export const catalogoRouter = Router();

catalogoRouter.get("/categorias", async (_req, res) => {
  const categorias = await prisma.categoria.findMany({
    where: { visible: true },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, slug: true },
  });
  res.json(categorias);
});

catalogoRouter.get("/productos", async (req, res) => {
  const { categoria, disponibilidad } = filtrosProductos.parse(req.query);
  const productos = await prisma.producto.findMany({
    where: {
      visible: true,
      categoria: { visible: true, ...(categoria && { slug: categoria }) },
      ...(disponibilidad && { disponibilidad }),
    },
    include: { fotos: true, categoria: true },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
  });
  res.json(productos.map(productoPublico));
});

catalogoRouter.get("/productos/:slug", async (req, res) => {
  const producto = await prisma.producto.findFirst({
    where: { slug: req.params.slug, visible: true, categoria: { visible: true } },
    include: { fotos: true, categoria: true },
  });
  if (!producto) throw new HttpError(404, "No encontramos ese producto");
  res.json(productoPublico(producto));
});

catalogoRouter.get("/galeria", async (_req, res) => {
  const trabajos = await prisma.trabajoGaleria.findMany({
    where: { visible: true },
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });
  res.json(trabajos.map(trabajoPublico));
});
