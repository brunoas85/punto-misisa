import { useSearchParams } from 'react-router-dom'
import { getCategorias, getProductos } from '../api/publico'
import { Cargando, MensajeError, Titulo } from '../components/Estado'
import { ProductoCard } from '../components/ProductoCard'
import { useCarga } from '../lib/useCarga'
import type { Disponibilidad } from '../types'

const DISPONIBILIDADES: { valor: Disponibilidad | ''; texto: string }[] = [
  { valor: '', texto: 'Todo' },
  { valor: 'disponible', texto: 'Listo para entregar' },
  { valor: 'por_encargo', texto: 'Por encargo' },
]

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
        activo ? 'border-tinta bg-tinta text-crudo' : 'border-arena bg-white/60 hover:border-tinta'
      }`}
    >
      {children}
    </button>
  )
}

export function CatalogoPage() {
  const [params, setParams] = useSearchParams()
  const categoria = params.get('categoria') ?? ''
  const disponibilidad = (params.get('disponibilidad') ?? '') as Disponibilidad | ''

  const { datos: categorias } = useCarga(getCategorias, [])
  const productos = useCarga(
    () => getProductos({ categoria: categoria || undefined, disponibilidad: disponibilidad || undefined }),
    [categoria, disponibilidad],
  )

  function filtrar(clave: string, valor: string) {
    const nuevos = new URLSearchParams(params)
    if (valor) nuevos.set(clave, valor)
    else nuevos.delete(clave)
    setParams(nuevos, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Titulo bajada="Cada prenda es única. Si algo te gusta pero no está en tu talle o color, pedilo por encargo.">
        Catálogo
      </Titulo>

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip activo={!categoria} onClick={() => filtrar('categoria', '')}>
          Todas
        </Chip>
        {categorias?.map((c) => (
          <Chip key={c.id} activo={categoria === c.slug} onClick={() => filtrar('categoria', c.slug)}>
            {c.nombre}
          </Chip>
        ))}
      </div>
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
        {DISPONIBILIDADES.map((d) => (
          <Chip key={d.valor} activo={disponibilidad === d.valor} onClick={() => filtrar('disponibilidad', d.valor)}>
            {d.texto}
          </Chip>
        ))}
      </div>

      {productos.cargando && <Cargando />}
      {productos.error && <MensajeError reintentar={productos.recargar}>{productos.error}</MensajeError>}
      {productos.datos?.length === 0 && (
        <p className="py-16 text-center text-tinta-suave">No hay prendas con esos filtros por ahora.</p>
      )}
      {productos.datos && productos.datos.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {productos.datos.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}
