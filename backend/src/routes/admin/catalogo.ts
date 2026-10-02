import { Router } from "express";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/slug.js";
import { BUCKET_PUBLICO, borrarFotos, subirFoto, urlPublica } from "../../lib/storage.js";
import { MAX_FOTOS, upload } from "../../middleware/upload.js";
import { actualizarTrabajoGaleria, categoria, producto, trabajoGaleria } from "../../schemas.js";

/** ABM de categorías, productos (con fotos) y galería de trabajos. */
export const catalogoAdminRouter = Router();

/** Slug único: si ya existe, le agrega -2, -3, ... */
async function slugLibre(nombre: string, existe: (slug: string) => Promise<boolean>) {
  const base = slugify(nombre) || "item";
  let slug = base;
  for (let n = 2; await existe(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// ── Categorías ───────────────────────────────────────────

catalogoAdminRouter.get("/categorias", async (_req, res) => {
  res.json(
    await prisma.categoria.findMany({
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      include: { _count: { select: { productos: true } } },
    }),
  );
});

catalogoAdminRouter.post("/categorias", async (req, res) => {
  const datos = categoria.parse(req.body);
  const slug = await slugLibre(datos.nombre, async (s) => (await prisma.categoria.count({ where: { slug: s } })) > 0);
  res.status(201).json(await prisma.categoria.create({ data: { ...datos, slug } }));
});

catalogoAdminRouter.put("/categorias/:id", async (req, res) => {
  res.json(await prisma.categoria.update({ where: { id: req.params.id }, data: categoria.parse(req.body) }));
});

catalogoAdminRouter.delete("/categorias/:id", async (req, res) => {
  const enUso = await prisma.producto.count({ where: { categoriaId: req.params.id } });
  if (enUso) throw new HttpError(409, "La categoría tiene productos: movelos u ocultala en vez de borrarla");
  await prisma.categoria.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// ── Productos ────────────────────────────────────────────

const conRelaciones = { fotos: { orderBy: { orden: "asc" as const } }, categoria: true };

function conUrls<P extends { fotos: { ruta: string }[] }>(p: P) {
  return { ...p, fotos: p.fotos.map((f) => ({ ...f, url: urlPublica(f.ruta) })) };
}

catalogoAdminRouter.get("/productos", async (_req, res) => {
  const productos = await prisma.producto.findMany({ include: conRelaciones, orderBy: { createdAt: "desc" } });
  res.json(productos.map(conUrls));
});

catalogoAdminRouter.get("/productos/:id", async (req, res) => {
  const p = await prisma.producto.findUnique({ where: { id: req.params.id }, include: conRelaciones });
  if (!p) throw new HttpError(404, "No encontramos ese producto");
  res.json(conUrls(p));
});

catalogoAdminRouter.post("/productos", async (req, res) => {
  const datos = producto.parse(req.body);
  const slug = await slugLibre(datos.nombre, async (s) => (await prisma.producto.count({ where: { slug: s } })) > 0);
  const p = await prisma.producto.create({ data: { ...datos, slug }, include: conRelaciones });
  res.status(201).json(conUrls(p));
});

catalogoAdminRouter.put("/productos/:id", async (req, res) => {
  const p = await prisma.producto.update({
    where: { id: req.params.id },
    data: producto.parse(req.body),
    include: conRelaciones,
  });
  res.json(conUrls(p));
});

catalogoAdminRouter.delete("/productos/:id", async (req, res) => {
  const vendido = await prisma.itemPedido.count({ where: { productoId: req.params.id } });
  if (vendido) throw new HttpError(409, "Este producto tiene pedidos: ocultalo en vez de borrarlo");
  const fotos = await prisma.fotoProducto.findMany({ where: { productoId: req.params.id } });
  await prisma.producto.delete({ where: { id: req.params.id } });
  await borrarFotos(BUCKET_PUBLICO, fotos.map((f) => f.ruta)).catch(() => {});
  res.status(204).end();
});

catalogoAdminRouter.post("/productos/:id/fotos", upload.array("fotos", MAX_FOTOS), async (req, res) => {
  const id = req.params.id as string;
  if (!(await prisma.producto.count({ where: { id } }))) throw new HttpError(404, "No encontramos ese producto");
  const archivos = (req.files as Express.Multer.File[] | undefined) ?? [];
  const ultima = await prisma.fotoProducto.findFirst({ where: { productoId: id }, orderBy: { orden: "desc" } });
  let orden = (ultima?.orden ?? -1) + 1;
  for (const archivo of archivos) {
    const ruta = await subirFoto(BUCKET_PUBLICO, `productos/${id}`, archivo);
    await prisma.fotoProducto.create({ data: { productoId: id, ruta, orden: orden++ } });
  }
  const p = await prisma.producto.findUniqueOrThrow({ where: { id }, include: conRelaciones });
  res.status(201).json(conUrls(p));
});

catalogoAdminRouter.delete("/productos/:id/fotos/:fotoId", async (req, res) => {
  const foto = await prisma.fotoProducto.findFirst({
    where: { id: req.params.fotoId, productoId: req.params.id },
  });
  if (!foto) throw new HttpError(404, "No encontramos esa foto");
  await prisma.fotoProducto.delete({ where: { id: foto.id } });
  await borrarFotos(BUCKET_PUBLICO, [foto.ruta]).catch(() => {});
  res.status(204).end();
});

// ── Galería de trabajos ──────────────────────────────────

catalogoAdminRouter.get("/galeria", async (_req, res) => {
  const trabajos = await prisma.trabajoGaleria.findMany({ orderBy: [{ orden: "asc" }, { createdAt: "desc" }] });
  res.json(trabajos.map((t) => ({ ...t, url: urlPublica(t.ruta) })));
});

catalogoAdminRouter.post("/galeria", upload.single("foto"), async (req, res) => {
  const datos = trabajoGaleria.parse(req.body);
  if (!req.file) throw new HttpError(400, "Falta la foto");
  const ruta = await subirFoto(BUCKET_PUBLICO, "galeria", req.file);
  const t = await prisma.trabajoGaleria.create({ data: { ...datos, ruta } });
  res.status(201).json({ ...t, url: urlPublica(t.ruta) });
});

catalogoAdminRouter.patch("/galeria/:id", async (req, res) => {
  const t = await prisma.trabajoGaleria.update({
    where: { id: req.params.id },
    data: actualizarTrabajoGaleria.parse(req.body),
  });
  res.json({ ...t, url: urlPublica(t.ruta) });
});

catalogoAdminRouter.delete("/galeria/:id", async (req, res) => {
  const t = await prisma.trabajoGaleria.delete({ where: { id: req.params.id } });
  await borrarFotos(BUCKET_PUBLICO, [t.ruta]).catch(() => {});
  res.status(204).end();
});
