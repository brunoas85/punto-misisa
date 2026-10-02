import { getProductosAdmin } from '../../api/admin'
import { Cargando, MensajeError } from '../../components/Estado'
import { precio } from '../../lib/format'
import { useCarga } from '../../lib/useCarga'

// TODO: formulario de alta/edición (POST/PUT /api/admin/productos) y subida de fotos

export function ProductosAdminPage() {
  const { datos, error, cargando, recargar } = useCarga(getProductosAdmin, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <button type="button" className="boton" disabled title="Próximamente">
          + Nuevo
        </button>
      </div>
      {cargando && <Cargando />}
      {error && <MensajeError reintentar={recargar}>{error}</MensajeError>}
      {datos?.length === 0 && <p className="py-12 text-center text-tinta-suave">Todavía no cargaste productos.</p>}
      <ul className="space-y-3">
        {datos?.map((p) => (
          <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white/70 p-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-lana">
              {p.fotos[0] && <img src={p.fotos[0].url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.nombre}</p>
              <p className="text-sm text-tinta-suave">
                {p.categoria.nombre} · {precio(p.precio)} ·{' '}
                {p.disponibilidad === 'por_encargo' ? 'Por encargo' : `Stock: ${p.stock}`}
                {!p.visible && ' · Oculto'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
