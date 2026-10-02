import type { z } from "zod";
import { HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { BUCKET_PRIVADO, borrarFotos, subirFoto, urlFirmada } from "../lib/storage.js";
import type { actualizarSolicitud, nuevoArreglo, nuevoEncargo } from "../schemas.js";
import { validarTransicionSolicitud } from "./estados.js";

type Archivos = Express.Multer.File[];

/** Sube las fotos y, si falla la creación del registro, las borra para no dejar huérfanas. */
async function conFotos<T>(carpeta: string, archivos: Archivos, crear: (rutas: string[]) => Promise<T>) {
  const rutas: string[] = [];
  try {
    for (const archivo of archivos) rutas.push(await subirFoto(BUCKET_PRIVADO, carpeta, archivo));
    return await crear(rutas);
  } catch (err) {
    await borrarFotos(BUCKET_PRIVADO, rutas).catch(() => {});
    throw err;
  }
}

export async function crearEncargo(datos: z.infer<typeof nuevoEncargo>, archivos: Archivos) {
  if (datos.productoBaseId) {
    const existe = await prisma.producto.count({ where: { id: datos.productoBaseId } });
    if (!existe) datos.productoBaseId = undefined;
  }
  return conFotos("encargos", archivos, (rutas) =>
    prisma.encargo.create({
      data: { ...datos, fotos: { create: rutas.map((ruta) => ({ ruta })) } },
    }),
  );
}

export async function crearArreglo(datos: z.infer<typeof nuevoArreglo>, archivos: Archivos) {
  return conFotos("arreglos", archivos, (rutas) =>
    prisma.arreglo.create({
      data: { ...datos, fotos: { create: rutas.map((ruta) => ({ ruta })) } },
    }),
  );
}

type Cambios = z.infer<typeof actualizarSolicitud>;

export async function actualizarEncargo(id: string, cambios: Cambios) {
  const actual = await prisma.encargo.findUnique({ where: { id } });
  if (!actual) throw new HttpError(404, "No encontramos ese encargo");
  if (cambios.estado) validarTransicionSolicitud(actual.estado, cambios.estado);
  return prisma.encargo.update({ where: { id }, data: cambios });
}

export async function actualizarArreglo(id: string, cambios: Cambios) {
  const actual = await prisma.arreglo.findUnique({ where: { id } });
  if (!actual) throw new HttpError(404, "No encontramos ese arreglo");
  if (cambios.estado) validarTransicionSolicitud(actual.estado, cambios.estado);
  return prisma.arreglo.update({ where: { id }, data: cambios });
}

/** Reemplaza las rutas privadas por URLs firmadas para que el panel pueda ver las fotos. */
export async function conUrlsFirmadas<T extends { fotos: { id: string; ruta: string }[] }>(solicitud: T) {
  const fotos = await Promise.all(
    solicitud.fotos.map(async (f) => ({ id: f.id, url: await urlFirmada(f.ruta) })),
  );
  return { ...solicitud, fotos };
}
