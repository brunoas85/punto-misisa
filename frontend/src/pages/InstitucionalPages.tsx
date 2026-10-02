import { Link } from 'react-router-dom'
import { getGaleria } from '../api/publico'
import { Cargando, MensajeError, Titulo } from '../components/Estado'
import { useCarga } from '../lib/useCarga'

// TODO: reemplazar los textos de ejemplo con la historia y los datos reales de la tejedora

export function SobreMiPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="aspect-[4/5] rounded-[2rem] bg-arena/70" aria-hidden />
      <div>
        <Titulo>Sobre mí</Titulo>
        <div className="space-y-4 leading-relaxed">
          <p>
            Tejo desde chica. Cada prenda que sale de mis agujas está hecha a mano, punto por punto, con lanas que elijo
            una por una.
          </p>
          <p>
            Me gusta tejer cosas que duren: prendas abrigadas, nobles, que se usan muchos inviernos y se arreglan cuando
            hace falta en vez de tirarlas.
          </p>
          <p className="text-tinta-suave">[Texto de ejemplo: completar con la historia real.]</p>
        </div>
        <Link to="/encargos" className="boton mt-8">
          Hacé tu encargo
        </Link>
      </div>
    </div>
  )
}

export function GaleriaPage() {
  const { datos, error, cargando, recargar } = useCarga(getGaleria, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Titulo bajada="Encargos y arreglos que ya se fueron a abrigar a alguien.">Trabajos realizados</Titulo>
      {cargando && <Cargando />}
      {error && <MensajeError reintentar={recargar}>{error}</MensajeError>}
      {datos?.length === 0 && <p className="py-16 text-center text-tinta-suave">Muy pronto, fotos de trabajos.</p>}
      <div className="columns-2 gap-4 md:columns-3">
        {datos?.map((t) => (
          <figure key={t.id} className="mb-4 break-inside-avoid">
            <img src={t.url} alt={t.titulo} loading="lazy" className="w-full rounded-2xl" />
            <figcaption className="mt-2 text-sm">
              <span className="font-semibold">{t.titulo}</span>
              {t.descripcion && <span className="block text-tinta-suave">{t.descripcion}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

const PREGUNTAS = [
  {
    p: '¿Cuánto tarda un encargo?',
    r: 'Depende de la prenda: un gorro puede estar en pocos días y un sweater lleva algunas semanas. Te paso la fecha estimada junto con el presupuesto.',
  },
  {
    p: '¿Cómo cuido mis tejidos?',
    r: 'Lavado a mano con agua fría y jabón neutro, sin retorcer. Secado en horizontal y a la sombra. Cada prenda trae sus indicaciones.',
  },
  {
    p: '¿Hacen envíos?',
    r: 'Sí, lo coordinamos por WhatsApp según tu zona.',
  },
  {
    p: '¿Cómo se paga?',
    r: 'Lo arreglamos por WhatsApp al confirmar el pedido. En los encargos se suele pedir una seña para comprar la lana.',
  },
  {
    p: '¿Arreglan prendas que no tejiste vos?',
    r: 'Sí. Mandame fotos desde la sección Arreglos y te digo si tiene arreglo.',
  },
]

export function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Titulo>Preguntas frecuentes</Titulo>
      <div className="divide-y divide-arena/60">
        {PREGUNTAS.map(({ p, r }) => (
          <details key={p} className="group py-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-titulo text-lg">
              {p}
              <span className="text-2xl transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-2 text-tinta-suave">{r}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export function NoEncontradaPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Se nos escapó este punto</h1>
      <p className="mt-3 text-tinta-suave">La página que buscás no existe.</p>
      <Link to="/" className="boton mt-8">
        Volver al inicio
      </Link>
    </div>
  )
}
