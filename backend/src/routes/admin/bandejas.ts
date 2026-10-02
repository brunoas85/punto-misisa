import { Router } from "express";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { actualizarPedido, actualizarSolicitud, filtroEstadoPedido, filtroEstadoSolicitud } from "../../schemas.js";
import { actualizarPedido as guardarPedido } from "../../services/pedidos.js";
import { actualizarArreglo, actualizarEncargo, conUrlsFirmadas } from "../../services/solicitudes.js";

/** Pedidos, encargos y arreglos que recibe la tejedora. */
export const bandejasRouter = Router();

const recientes = { orderBy: { createdAt: "desc" as const } };

// ── Pedidos ──────────────────────────────────────────────

bandejasRouter.get("/pedidos", async (req, res) => {
  const { estado } = filtroEstadoPedido.parse(req.query);
  res.json(await prisma.pedido.findMany({ where: { estado }, include: { items: true }, ...recientes }));
});

bandejasRouter.get("/pedidos/:id", async (req, res) => {
  const pedido = await prisma.pedido.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!pedido) throw new HttpError(404, "No encontramos ese pedido");
  res.json(pedido);
});

bandejasRouter.patch("/pedidos/:id", async (req, res) => {
  res.json(await guardarPedido(req.params.id, actualizarPedido.parse(req.body)));
});

// ── Encargos ─────────────────────────────────────────────

bandejasRouter.get("/encargos", async (req, res) => {
  const { estado } = filtroEstadoSolicitud.parse(req.query);
  res.json(
    await prisma.encargo.findMany({
      where: { estado },
      include: { _count: { select: { fotos: true } } },
      ...recientes,
    }),
  );
});

bandejasRouter.get("/encargos/:id", async (req, res) => {
  const encargo = await prisma.encargo.findUnique({
    where: { id: req.params.id },
    include: { fotos: true, productoBase: { select: { nombre: true, slug: true } } },
  });
  if (!encargo) throw new HttpError(404, "No encontramos ese encargo");
  res.json(await conUrlsFirmadas(encargo));
});

bandejasRouter.patch("/encargos/:id", async (req, res) => {
  res.json(await actualizarEncargo(req.params.id, actualizarSolicitud.parse(req.body)));
});

// ── Arreglos ─────────────────────────────────────────────

bandejasRouter.get("/arreglos", async (req, res) => {
  const { estado } = filtroEstadoSolicitud.parse(req.query);
  res.json(
    await prisma.arreglo.findMany({
      where: { estado },
      include: { _count: { select: { fotos: true } } },
      ...recientes,
    }),
  );
});

bandejasRouter.get("/arreglos/:id", async (req, res) => {
  const arreglo = await prisma.arreglo.findUnique({ where: { id: req.params.id }, include: { fotos: true } });
  if (!arreglo) throw new HttpError(404, "No encontramos ese arreglo");
  res.json(await conUrlsFirmadas(arreglo));
});

bandejasRouter.patch("/arreglos/:id", async (req, res) => {
  res.json(await actualizarArreglo(req.params.id, actualizarSolicitud.parse(req.body)));
});
