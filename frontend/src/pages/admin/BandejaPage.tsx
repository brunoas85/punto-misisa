import { useState } from 'react'
import { actualizarBandeja, getBandeja, type BandejaTipos, type TipoBandeja } from '../../api/admin'
import { Cargando, MensajeError } from '../../components/Estado'
import { ETIQUETA_ESTADO, fecha, precio } from '../../lib/format'
import { useCarga } from '../../lib/useCarga'
import type { Arreglo, Encargo, Pedido } from '../../types'

// Espejo de las transiciones de backend/src/services/estados.ts (el backend es quien valida)
const SIGUIENTES: Record<string, string[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['entregado', 'cancelado'],
  nuevo: ['presupuestado', 'cancelado'],
  presupuestado: ['en_proceso', 'cancelado'],
  en_proceso: ['listo', 'cancelado'],
  listo: ['entregado', 'cancelado'],
}

const ESTADOS: Record<TipoBandeja, string[]> = {
  pedidos: ['pendiente', 'confirmado', 'entregado', 'cancelado'],
  encargos: ['nuevo', 'presupuestado', 'en_proceso', 'listo', 'entregado', 'cancelado'],
  arreglos: ['nuevo', 'presupuestado', 'en_proceso', 'listo', 'entregado', 'cancelado'],
}

const TITULOS: Record<TipoBandeja, string> = { pedidos: 'Pedidos', encargos: 'Encargos', arreglos: 'Arreglos' }

type Item = BandejaTipos[TipoBandeja]

function Detalle({ tipo, item }: { tipo: TipoBandeja; item: Item }) {
  if (tipo === 'pedidos') {
    const p = item as Pedido
    return (
      <>
        <ul className="text-sm">
          {p.items.map((i) => (
            <li key={i.id}>
              {i.cantidad} × {i.nombreProducto} ({precio(i.precioUnitario)})
            </li>
          ))}
        </ul>
        <p className="font-semibold">Total: {precio(p.total)}</p>
        <p className="text-sm">Entrega: {p.zona}</p>
        {p.comentario && <p className="text-sm">“{p.comentario}”</p>}
      </>
    )
  }
  if (tipo === 'encargos') {
    const e = item as Encargo
    const filas: [string, string | null][] = [
      ['Talle', e.talle],
      ['Medidas', e.medidas],
      ['Colores', e.colores],
      ['Fibra', e.fibra],
      ['Para el', e.fechaDeseada && fecha(e.fechaDeseada)],
      ['Comentario', e.comentario],
    ]
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
        {filas
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-semibold">{k}</dt>
              <dd className="whitespace-pre-line">{v}</dd>
            </div>
          ))}
      </dl>
    )
  }
  return <p className="whitespace-pre-line text-sm">{(item as Arreglo).descripcion}</p>
}

function Tarjeta({ tipo, item, alGuardar }: { tipo: TipoBandeja; item: Item; alGuardar: () => void }) {
  const [abierta, setAbierta] = useState(false)
  const [notas, setNotas] = useState(item.notas ?? '')
  const [presupuesto, setPresupuesto] = useState('presupuesto' in item && item.presupuesto != null ? String(item.presupuesto) : '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string>()
  const esSolicitud = tipo !== 'pedidos'
  const titulo = 'tipoPrenda' in item ? item.tipoPrenda : `${(item as Pedido).items.length} prenda(s)`

  async function guardar(estado?: string) {
    setGuardando(true)
    setError(undefined)
    try {
      await actualizarBandeja(tipo, item.id, {
        ...(estado && { estado: estado as Pedido['estado'] }),
        notas: notas || null,
        ...(esSolicitud && { presupuesto: presupuesto ? Number(presupuesto) : null }),
      })
      alGuardar()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <li className="rounded-2xl bg-white/70">
      <button type="button" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta} className="flex w-full items-start justify-between gap-4 p-4 text-left">
        <span>
          <span className="block font-semibold">
            #{item.numero} · {item.nombre}
          </span>
          <span className="block text-sm text-tinta-suave">
            {titulo} · {fecha(item.createdAt)}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-lana px-3 py-1 text-xs font-semibold">{ETIQUETA_ESTADO[item.estado]}</span>
      </button>

      {abierta && (
        <div className="space-y-4 border-t border-arena/60 p-4">
          <Detalle tipo={tipo} item={item} />
          <a href={`https://wa.me/${item.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-terracota underline">
            WhatsApp: {item.telefono}
          </a>
          {esSolicitud && (
            <label className="block">
              <span className="text-sm font-semibold">Presupuesto ($)</span>
              <input className="campo mt-1" inputMode="numeric" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value.replace(/\D/g, ''))} />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold">Notas (solo las ves vos)</span>
            <textarea className="campo mt-1 min-h-20" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </label>
          {error && (
            <p className="text-sm text-terracota-oscuro" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="boton-secundario" disabled={guardando} onClick={() => guardar()}>
              Guardar
            </button>
            {(SIGUIENTES[item.estado] ?? []).map((s) => (
              <button
                key={s}
                type="button"
                disabled={guardando}
                onClick={() => guardar(s)}
                className={s === 'cancelado' ? 'boton-secundario' : 'boton'}
              >
                {s === 'cancelado' ? 'Cancelar' : `Pasar a ${ETIQUETA_ESTADO[s].toLowerCase()}`}
              </button>
            ))}
          </div>
          {/* TODO: ver fotos (GET /api/admin/{tipo}/:id trae URLs firmadas) */}
        </div>
      )}
    </li>
  )
}

export function BandejaPage({ tipo }: { tipo: TipoBandeja }) {
  const [estado, setEstado] = useState('')
  const { datos, error, cargando, recargar } = useCarga(() => getBandeja(tipo, estado || undefined), [tipo, estado])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{TITULOS[tipo]}</h1>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {['', ...ESTADOS[tipo]].map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEstado(e)}
            aria-pressed={estado === e}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold ${estado === e ? 'border-tinta bg-tinta text-crudo' : 'border-arena'}`}
          >
            {e ? ETIQUETA_ESTADO[e] : 'Todos'}
          </button>
        ))}
      </div>
      {cargando && !datos && <Cargando />}
      {error && <MensajeError reintentar={recargar}>{error}</MensajeError>}
      {datos?.length === 0 && <p className="py-12 text-center text-tinta-suave">No hay nada acá por ahora.</p>}
      <ul className="space-y-3">
        {datos?.map((item) => (
          <Tarjeta key={`${item.id}-${item.estado}`} tipo={tipo} item={item} alGuardar={recargar} />
        ))}
      </ul>
    </div>
  )
}
