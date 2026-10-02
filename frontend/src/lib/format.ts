const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export function precio(valor: number | null | undefined): string {
  return valor == null ? 'A consultar' : pesos.format(valor)
}

const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

export function fecha(iso: string | null | undefined): string {
  return iso ? fechaCorta.format(new Date(iso)) : '—'
}

export const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  nuevo: 'Nuevo',
  presupuestado: 'Presupuestado',
  en_proceso: 'En proceso',
  listo: 'Listo',
}
