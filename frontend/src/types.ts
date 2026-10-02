// Tipos espejo del contrato de API en CLAUDE.md

export type Disponibilidad = 'disponible' | 'por_encargo'
export type EstadoPedido = 'pendiente' | 'confirmado' | 'entregado' | 'cancelado'
export type EstadoSolicitud = 'nuevo' | 'presupuestado' | 'en_proceso' | 'listo' | 'entregado' | 'cancelado'

export interface Categoria {
  id: string
  nombre: string
  slug: string
}

export interface Foto {
  id: string
  url: string
  alt: string
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion: string
  categoria: { nombre: string; slug: string }
  /** Pesos sin decimales; null = a consultar */
  precio: number | null
  stock: number
  disponibilidad: Disponibilidad
  diasConfeccion: number | null
  fibra: string | null
  talles: string[]
  colores: string[]
  cuidados: string | null
  destacado: boolean
  fotos: Foto[]
}

export interface TrabajoGaleria {
  id: string
  titulo: string
  descripcion: string | null
  url: string
}

export interface DatosCliente {
  nombre: string
  telefono: string
  zona: string
  comentario?: string
}

export interface NuevoPedido {
  cliente: DatosCliente
  items: { productoId: string; cantidad: number }[]
}

export interface Creado {
  id: string
  numero: number
}

// ── Panel ────────────────────────────────────────────────

export interface ItemPedido {
  id: string
  nombreProducto: string
  precioUnitario: number
  cantidad: number
}

export interface Pedido {
  id: string
  numero: number
  nombre: string
  telefono: string
  zona: string
  comentario: string | null
  estado: EstadoPedido
  total: number
  notas: string | null
  items: ItemPedido[]
  createdAt: string
}

interface SolicitudBase {
  id: string
  numero: number
  nombre: string
  telefono: string
  zona: string | null
  tipoPrenda: string
  estado: EstadoSolicitud
  presupuesto: number | null
  fechaEstimada: string | null
  notas: string | null
  createdAt: string
  _count?: { fotos: number }
}

export interface Encargo extends SolicitudBase {
  talle: string | null
  medidas: string | null
  colores: string | null
  fibra: string | null
  fechaDeseada: string | null
  comentario: string | null
}

export interface Arreglo extends SolicitudBase {
  descripcion: string
}
