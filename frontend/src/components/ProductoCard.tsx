import { Link } from 'react-router-dom'
import { precio } from '../lib/format'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const foto = producto.fotos[0]
  const vendido = producto.disponibilidad === 'disponible' && producto.stock === 0

  return (
    <Link to={`/catalogo/${producto.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-lana">
        {foto ? (
          <img
            src={foto.url}
            alt={foto.alt}
            loading="lazy"
            width={400}
            height={500}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-tinta-suave">Foto próximamente</div>
        )}
        {producto.disponibilidad === 'por_encargo' && (
          <span className="absolute left-3 top-3 rounded-full bg-oliva px-3 py-1 text-xs font-semibold text-crudo">
            Por encargo
          </span>
        )}
        {vendido && (
          <span className="absolute left-3 top-3 rounded-full bg-tinta px-3 py-1 text-xs font-semibold text-crudo">
            Vendido
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-tinta-suave">{producto.categoria.nombre}</p>
      <h3 className="font-titulo text-lg leading-snug group-hover:text-terracota">{producto.nombre}</h3>
      <p className="font-semibold">{precio(producto.precio)}</p>
    </Link>
  )
}
