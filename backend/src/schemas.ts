import { z } from "zod";

/** Texto opcional: un string vacío (típico de formularios multipart) cuenta como ausente. */
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => v || undefined);

const textoRequerido = (campo: string, max = 200) =>
  z.string(`Falta ${campo}`).trim().min(1, `Falta ${campo}`).max(max, `Máximo ${max} caracteres`);

const fechaOpcional = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.date("Fecha inválida").optional(),
);

const contacto = {
  nombre: textoRequerido("tu nombre", 100),
  telefono: textoRequerido("un teléfono o WhatsApp", 30),
};

// ── Público ──────────────────────────────────────────────

export const filtrosProductos = z.object({
  categoria: textoOpcional(80),
  disponibilidad: z.enum(["disponible", "por_encargo"]).optional(),
});

export const nuevoPedido = z.object({
  cliente: z.object({
    ...contacto,
    zona: textoRequerido("la zona o dirección de entrega"),
    comentario: textoOpcional(1000),
  }),
  items: z
    .array(
      z.object({
        productoId: z.string().min(1),
        cantidad: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "El carrito está vacío"),
});

export const nuevoEncargo = z.object({
  ...contacto,
  zona: textoOpcional(200),
  tipoPrenda: textoRequerido("el tipo de prenda", 100),
  productoBaseId: textoOpcional(50),
  talle: textoOpcional(50),
  medidas: textoOpcional(500),
  colores: textoOpcional(200),
  fibra: textoOpcional(100),
  fechaDeseada: fechaOpcional,
  comentario: textoOpcional(2000),
});

export const nuevoArreglo = z.object({
  ...contacto,
  zona: textoOpcional(200),
  tipoPrenda: textoRequerido("el tipo de prenda", 100),
  descripcion: textoRequerido("qué hay que arreglar", 2000),
});

// ── Admin ────────────────────────────────────────────────

export const login = z.object({
  usuario: textoRequerido("el usuario", 50),
  password: textoRequerido("la contraseña", 200),
});

export const categoria = z.object({
  nombre: textoRequerido("el nombre", 80),
  orden: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const producto = z.object({
  nombre: textoRequerido("el nombre", 120),
  descripcion: z.string().trim().max(5000).default(""),
  categoriaId: z.string().min(1, "Elegí una categoría"),
  precio: z.number().int().min(0).nullable().default(null),
  stock: z.number().int().min(0).default(0),
  disponibilidad: z.enum(["disponible", "por_encargo"]).default("disponible"),
  diasConfeccion: z.number().int().min(1).nullable().default(null),
  fibra: z.string().trim().max(100).nullable().default(null),
  talles: z.array(z.string().trim().min(1)).default([]),
  colores: z.array(z.string().trim().min(1)).default([]),
  cuidados: z.string().trim().max(1000).nullable().default(null),
  visible: z.boolean().default(true),
  destacado: z.boolean().default(false),
});

export const trabajoGaleria = z.object({
  titulo: textoRequerido("el título", 120),
  descripcion: textoOpcional(1000),
  orden: z.coerce.number().int().default(0),
});

export const actualizarTrabajoGaleria = z.object({
  titulo: textoRequerido("el título", 120).optional(),
  descripcion: z.string().trim().max(1000).nullable().optional(),
  orden: z.number().int().optional(),
  visible: z.boolean().optional(),
});

const estadoPedido = z.enum(["pendiente", "confirmado", "entregado", "cancelado"], "Estado inválido");
const estadoSolicitud = z.enum(
  ["nuevo", "presupuestado", "en_proceso", "listo", "entregado", "cancelado"],
  "Estado inválido",
);

export const filtroEstadoPedido = z.object({ estado: estadoPedido.optional() });
export const filtroEstadoSolicitud = z.object({ estado: estadoSolicitud.optional() });

export const actualizarPedido = z.object({
  estado: estadoPedido.optional(),
  notas: z.string().max(2000).nullable().optional(),
});

export const actualizarSolicitud = z.object({
  estado: estadoSolicitud.optional(),
  presupuesto: z.number().int().min(0).nullable().optional(),
  fechaEstimada: z.coerce.date().nullable().optional(),
  notas: z.string().max(2000).nullable().optional(),
});
