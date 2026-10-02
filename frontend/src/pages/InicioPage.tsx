import { Link } from 'react-router-dom'
import { getProductos } from '../api/publico'
import { ProductoCard } from '../components/ProductoCard'
import { useCarga } from '../lib/useCarga'

const SERVICIOS = [
  {
    titulo: 'Prendas listas',
    texto: 'Gorros, chalecos, sweaters y medias ya tejidos, para llevar hoy.',
    to: '/catalogo?disponibilidad=disponible',
    accion: 'Ver disponibles',
  },
  {
    titulo: 'Encargos a medida',
    texto: 'Elegí el modelo, el talle, los colores y la lana. Lo tejo para vos.',
    to: '/encargos',
    accion: 'Pedir un encargo',
  },
  {
    titulo: 'Arreglos',
    texto: 'Ese sweater querido con un agujero tiene arreglo. Mandame una foto.',
    to: '/arreglos',
    accion: 'Consultar un arreglo',
  },
]

export function InicioPage() {
  const { datos: productos } = useCarga(() => getProductos(), [])
  const destacados = productos?.filter((p) => p.destacado).slice(0, 4) ?? []

  return (
    <>
      {/* TODO: foto de portada real (design-sources/ → public/brand/) */}
      <section className="bg-lana">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-semibold uppercase tracking-widest text-terracota">Hecho a mano, punto por punto</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Tejidos 100% artesanales para abrigarte con algo único
            </h1>
            <p className="mt-4 text-lg text-tinta-suave">
              Prendas tejidas a mano con lanas nobles. Encargos a tu medida y arreglos para que tus tejidos duren
              muchos inviernos más.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="boton">
                Ver el catálogo
              </Link>
              <Link to="/encargos" className="boton-secundario">
                Hacer un encargo
              </Link>
            </div>
          </div>
          <div className="aspect-[4/5] rounded-[2rem] bg-arena/70" aria-hidden />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICIOS.map((s) => (
            <div key={s.titulo} className="rounded-2xl bg-white/60 p-6">
              <h2 className="text-2xl font-semibold">{s.titulo}</h2>
              <p className="mt-2 text-tinta-suave">{s.texto}</p>
              <Link to={s.to} className="mt-4 inline-block font-semibold text-terracota hover:underline">
                {s.accion} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-3xl font-semibold">Recién salidos de las agujas</h2>
            <Link to="/catalogo" className="font-semibold text-terracota hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {destacados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
