import type { Categoria, FotoProducto, Producto, TrabajoGaleria } from "@prisma/client";
import { urlPublica } from "../lib/storage.js";

type ProductoConRelaciones = Producto & { fotos: FotoProducto[]; categoria: Categoria };

/** Forma pública de un producto: fotos con URL y sin campos internos. */
export function productoPublico(p: ProductoConRelaciones) {
  return {
    id: p.id,
    nombre: p.nombre,
    slug: p.slug,
    descripcion: p.descripcion,
    categoria: { nombre: p.categoria.nombre, slug: p.categoria.slug },
    precio: p.precio,
    stock: p.stock,
    disponibilidad: p.disponibilidad,
    diasConfeccion: p.diasConfeccion,
    fibra: p.fibra,
    talles: p.talles,
    colores: p.colores,
    cuidados: p.cuidados,
    destacado: p.destacado,
    fotos: [...p.fotos]
      .sort((a, b) => a.orden - b.orden)
      .map((f) => ({ id: f.id, url: urlPublica(f.ruta), alt: f.alt || p.nombre })),
  };
}

export function trabajoPublico(t: TrabajoGaleria) {
  return { id: t.id, titulo: t.titulo, descripcion: t.descripcion, url: urlPublica(t.ruta) };
}
