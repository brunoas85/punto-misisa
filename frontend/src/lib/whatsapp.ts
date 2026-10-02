import { precio } from './format'

const NUMERO = import.meta.env.VITE_WHATSAPP ?? ''

export function linkWhatsApp(texto: string): string {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`
}

export const linkConsulta = () => linkWhatsApp('¡Hola! Quería hacerte una consulta sobre tus tejidos.')

export function mensajePedido(
  numero: number,
  items: { nombre: string; cantidad: number; precio: number }[],
  total: number,
  cliente: { nombre: string; zona: string },
): string {
  const lineas = items.map((i) => `• ${i.cantidad} × ${i.nombre} (${precio(i.precio)})`)
  return [
    `¡Hola! Soy ${cliente.nombre} e hice el pedido #${numero} en la web:`,
    ...lineas,
    `Total: ${precio(total)}`,
    `Entrega en: ${cliente.zona}`,
    '¿Cómo seguimos con el pago y la entrega?',
  ].join('\n')
}

export function mensajeEncargo(numero: number, nombre: string, tipoPrenda: string): string {
  return `¡Hola! Soy ${nombre} y te mandé el encargo #${numero} desde la web (${tipoPrenda}). Quedo atenta/o al presupuesto.`
}

export function mensajeArreglo(numero: number, nombre: string, tipoPrenda: string): string {
  return `¡Hola! Soy ${nombre} y te mandé la consulta de arreglo #${numero} desde la web (${tipoPrenda}). Quedo atenta/o al presupuesto.`
}
