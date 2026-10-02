import { Router } from "express";
import rateLimit from "express-rate-limit";
import { MAX_FOTOS, upload } from "../../middleware/upload.js";
import { nuevoArreglo, nuevoEncargo, nuevoPedido } from "../../schemas.js";
import { crearPedido } from "../../services/pedidos.js";
import { crearArreglo, crearEncargo } from "../../services/solicitudes.js";

export const solicitudesRouter = Router();

// Freno básico al spam en los formularios públicos
const limite = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Mandaste muchas solicitudes seguidas, esperá unos minutos" },
});

const archivos = (files: unknown) => (files as Express.Multer.File[] | undefined) ?? [];

solicitudesRouter.post("/pedidos", limite, async (req, res) => {
  const pedido = await crearPedido(nuevoPedido.parse(req.body));
  res.status(201).json({ id: pedido.id, numero: pedido.numero, total: pedido.total });
});

solicitudesRouter.post("/encargos", limite, upload.array("fotos", MAX_FOTOS), async (req, res) => {
  const encargo = await crearEncargo(nuevoEncargo.parse(req.body), archivos(req.files));
  res.status(201).json({ id: encargo.id, numero: encargo.numero });
});

solicitudesRouter.post("/arreglos", limite, upload.array("fotos", MAX_FOTOS), async (req, res) => {
  const arreglo = await crearArreglo(nuevoArreglo.parse(req.body), archivos(req.files));
  res.status(201).json({ id: arreglo.id, numero: arreglo.numero });
});
