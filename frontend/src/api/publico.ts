import type { Categoria, Creado, Disponibilidad, NuevoPedido, Producto, TrabajoGaleria } from '../types'
import { api, json } from './client'

export const getCategorias = () => api<Categoria[]>('/categorias')

export function getProductos(filtros: { categoria?: string; disponibilidad?: Disponibilidad } = {}) {
  const params = new URLSearchParams()
  if (filtros.categoria) params.set('categoria', filtros.categoria)
  if (filtros.disponibilidad) params.set('disponibilidad', filtros.disponibilidad)
  const qs = params.toString()
  return api<Producto[]>(`/productos${qs ? `?${qs}` : ''}`)
}

export const getProducto = (slug: string) => api<Producto>(`/productos/${encodeURIComponent(slug)}`)

export const getGaleria = () => api<TrabajoGaleria[]>('/galeria')

export const crearPedido = (pedido: NuevoPedido) =>
  api<Creado & { total: number }>('/pedidos', { method: 'POST', body: json(pedido) })

/** Encargos y arreglos van como multipart porque pueden llevar fotos. */
export const crearEncargo = (datos: FormData) => api<Creado>('/encargos', { method: 'POST', body: datos })

export const crearArreglo = (datos: FormData) => api<Creado>('/arreglos', { method: 'POST', body: datos })
