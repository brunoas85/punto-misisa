import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { crearPedido } from '../api/publico'
import { Confirmacion } from '../components/Confirmacion'
import { Titulo } from '../components/Estado'
import { useCarrito } from '../context/CartContext'
import { precio } from '../lib/format'
import { linkWhatsApp, mensajePedido } from '../lib/whatsapp'

export function CarritoPage() {
  const { items, subtotal, cambiarCantidad, quitar, vaciar } = useCarrito()
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', zona: '', comentario: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string>()
  const [listo, setListo] = useState<{ numero: number; link: string }>()

  if (listo) {
    return (
      <Confirmacion
        titulo={`¡Pedido #${listo.numero} recibido!`}
        texto="Ahora escribime por WhatsApp para coordinar el pago y la entrega. El mensaje ya va armado."
        linkWhatsApp={listo.link}
      />
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold">Tu carrito está vacío</h1>
        <Link to="/catalogo" className="boton mt-8">
          Ver el catálogo
        </Link>
      </div>
    )
  }

  async function confirmar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(undefined)
    try {
      const pedido = await crearPedido({
        cliente: { ...cliente, comentario: cliente.comentario || undefined },
        items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      })
      const texto = mensajePedido(
        pedido.numero,
        items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
        pedido.total,
        cliente,
      )
      setListo({ numero: pedido.numero, link: linkWhatsApp(texto) })
      vaciar()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (clave: keyof typeof cliente) => ({
    value: cliente[clave],
    onChange: (e: { target: { value: string } }) => setCliente((c) => ({ ...c, [clave]: e.target.value })),
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Titulo>Tu carrito</Titulo>

      <ul className="divide-y divide-arena/60">
        {items.map((i) => (
          <li key={i.productoId} className="flex gap-4 py-4">
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-lana">
              {i.foto && <img src={i.foto} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex flex-1 flex-col">
              <Link to={`/catalogo/${i.slug}`} className="font-titulo text-lg hover:text-terracota">
                {i.nombre}
              </Link>
              <p className="font-semibold">{precio(i.precio)}</p>
              <div className="mt-auto flex items-center gap-3">
                {i.stock > 1 && (
                  <label className="flex items-center gap-2 text-sm">
                    Cantidad
                    <select
                      className="campo w-20"
                      value={i.cantidad}
                      onChange={(e) => cambiarCantidad(i.productoId, Number(e.target.value))}
                    >
                      {Array.from({ length: Math.min(i.stock, 20) }, (_, n) => n + 1).map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                )}
                <button type="button" className="min-h-11 text-sm underline" onClick={() => quitar(i.productoId)}>
                  Quitar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between border-t border-tinta/20 pt-4 text-lg font-semibold">
        <span>Subtotal</span>
        <span>{precio(subtotal)}</span>
      </p>
      <p className="mt-1 text-sm text-tinta-suave">El envío y la forma de pago los coordinamos por WhatsApp.</p>

      <form onSubmit={confirmar} className="mt-10 space-y-4 rounded-2xl bg-white/60 p-6">
        <h2 className="text-2xl font-semibold">Tus datos</h2>
        <label className="block">
          <span className="font-semibold">Nombre</span>
          <input className="campo mt-1" required autoComplete="name" {...campo('nombre')} />
        </label>
        <label className="block">
          <span className="font-semibold">WhatsApp o teléfono</span>
          <input className="campo mt-1" required type="tel" autoComplete="tel" {...campo('telefono')} />
        </label>
        <label className="block">
          <span className="font-semibold">Zona o dirección de entrega</span>
          <input className="campo mt-1" required autoComplete="street-address" {...campo('zona')} />
        </label>
        <label className="block">
          <span className="font-semibold">Comentario (opcional)</span>
          <textarea className="campo mt-1 min-h-24" {...campo('comentario')} />
        </label>
        {error && (
          <p className="text-terracota-oscuro" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton w-full" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  )
}
