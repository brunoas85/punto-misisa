import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProducto } from '../api/publico'
import { Cargando, MensajeError } from '../components/Estado'
import { useCarrito } from '../context/CartContext'
import { precio } from '../lib/format'
import { useCarga } from '../lib/useCarga'

export function ProductoPage() {
  const { slug = '' } = useParams()
  const { datos: p, error, cargando, recargar } = useCarga(() => getProducto(slug), [slug])
  const { agregar, items } = useCarrito()
  const [fotoActiva, setFotoActiva] = useState(0)
  const [aviso, setAviso] = useState<string>()

  if (cargando) return <Cargando />
  if (error || !p)
    return (
      <div className="mx-auto max-w-6xl px-4">
        <MensajeError reintentar={recargar}>{error ?? 'No encontramos ese producto'}</MensajeError>
      </div>
    )

  const enCarrito = items.find((i) => i.productoId === p.id)?.cantidad ?? 0
  const porEncargo = p.disponibilidad === 'por_encargo'
  const agotado = !porEncargo && p.stock - enCarrito <= 0
  const foto = p.fotos[fotoActiva] ?? p.fotos[0]

  function sumar() {
    if (!p) return
    setAviso(agregar(p) ? '¡Listo! Lo sumaste al carrito.' : 'No quedan más unidades de esta prenda.')
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div>
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-lana">
          {foto ? (
            <img src={foto.url} alt={foto.alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-tinta-suave">Foto próximamente</div>
          )}
        </div>
        {p.fotos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {p.fotos.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFotoActiva(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === fotoActiva}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === fotoActiva ? 'border-terracota' : 'border-transparent'}`}
              >
                <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Link to={`/catalogo?categoria=${p.categoria.slug}`} className="text-sm text-tinta-suave hover:text-terracota">
          {p.categoria.nombre}
        </Link>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{p.nombre}</h1>
        <p className="mt-3 text-2xl font-semibold">{precio(p.precio)}</p>

        {porEncargo ? (
          <p className="mt-2 text-oliva">
            Se teje a pedido{p.diasConfeccion ? ` · demora aprox. ${p.diasConfeccion} días` : ''}
          </p>
        ) : (
          <p className="mt-2 text-oliva">{p.stock > 0 ? 'Lista para entregar' : 'Vendida'}</p>
        )}

        {p.descripcion && <p className="mt-6 whitespace-pre-line leading-relaxed">{p.descripcion}</p>}

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {p.fibra && (
            <>
              <dt className="font-semibold">Fibra</dt>
              <dd>{p.fibra}</dd>
            </>
          )}
          {p.talles.length > 0 && (
            <>
              <dt className="font-semibold">Talles</dt>
              <dd>{p.talles.join(', ')}</dd>
            </>
          )}
          {p.colores.length > 0 && (
            <>
              <dt className="font-semibold">Colores</dt>
              <dd>{p.colores.join(', ')}</dd>
            </>
          )}
          {p.cuidados && (
            <>
              <dt className="font-semibold">Cuidados</dt>
              <dd>{p.cuidados}</dd>
            </>
          )}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {porEncargo || p.precio === null ? (
            <Link to={`/encargos?producto=${p.id}&prenda=${encodeURIComponent(p.nombre)}`} className="boton">
              Encargar esta prenda
            </Link>
          ) : (
            <button type="button" className="boton" onClick={sumar} disabled={agotado}>
              {agotado ? (enCarrito ? 'Ya está en tu carrito' : 'Vendida') : 'Agregar al carrito'}
            </button>
          )}
          {!porEncargo && (
            <Link to={`/encargos?producto=${p.id}&prenda=${encodeURIComponent(p.nombre)}`} className="boton-secundario">
              La quiero en otro talle o color
            </Link>
          )}
        </div>
        {aviso && (
          <p className="mt-3 text-sm" role="status">
            {aviso} {enCarrito > 0 && <Link to="/carrito" className="font-semibold underline">Ir al carrito</Link>}
          </p>
        )}
      </div>
    </div>
  )
}
