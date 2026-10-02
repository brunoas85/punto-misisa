import type { Arreglo, Encargo, EstadoPedido, EstadoSolicitud, Pedido, Producto } from '../types'
import { api, json } from './client'

export const login = (usuario: string, password: string) =>
  api<{ token: string }>('/admin/login', { method: 'POST', body: json({ usuario, password }) })

export const getProductosAdmin = () =>
  api<(Omit<Producto, 'categoria'> & { visible: boolean; categoria: { nombre: string } })[]>('/admin/productos')

// ── Bandejas ─────────────────────────────────────────────

export type TipoBandeja = 'pedidos' | 'encargos' | 'arreglos'

export interface BandejaTipos {
  pedidos: Pedido
  encargos: Encargo
  arreglos: Arreglo
}

export function getBandeja<T extends TipoBandeja>(tipo: T, estado?: string) {
  return api<BandejaTipos[T][]>(`/admin/${tipo}${estado ? `?estado=${estado}` : ''}`)
}

export interface CambiosBandeja {
  estado?: EstadoPedido | EstadoSolicitud
  presupuesto?: number | null
  fechaEstimada?: string | null
  notas?: string | null
}

export function actualizarBandeja<T extends TipoBandeja>(tipo: T, id: string, cambios: CambiosBandeja) {
  return api<BandejaTipos[T]>(`/admin/${tipo}/${id}`, { method: 'PATCH', body: json(cambios) })
}
