import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { crearEncargo } from '../api/publico'
import { Confirmacion } from '../components/Confirmacion'
import { Titulo } from '../components/Estado'
import { FotosInput } from '../components/FotosInput'
import { comprimir } from '../lib/imagenes'
import { linkWhatsApp, mensajeEncargo } from '../lib/whatsapp'

const PRENDAS = ['Gorro', 'Chaleco', 'Sweater', 'Medias', 'Bufanda o cuello', 'Guantes', 'Manta', 'Ropa de bebé', 'Otra']

export function EncargosPage() {
  const [params] = useSearchParams()
  const productoBaseId = params.get('producto') ?? ''
  const [datos, setDatos] = useState({
    nombre: '',
    telefono: '',
    zona: '',
    tipoPrenda: params.get('prenda') ?? '',
    talle: '',
    medidas: '',
    colores: '',
    fibra: '',
    fechaDeseada: '',
    comentario: '',
  })
  const [fotos, setFotos] = useState<File[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string>()
  const [listo, setListo] = useState<{ numero: number; link: string }>()

  if (listo) {
    return (
      <Confirmacion
        titulo={`¡Encargo #${listo.numero} recibido!`}
        texto="Lo reviso y te paso presupuesto y fecha estimada. Si querés, escribime ahora por WhatsApp para adelantar."
        linkWhatsApp={listo.link}
      />
    )
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(undefined)
    try {
      const form = new FormData()
      for (const [k, v] of Object.entries(datos)) form.append(k, v)
      if (productoBaseId) form.append('productoBaseId', productoBaseId)
      for (const f of await Promise.all(fotos.map(comprimir))) form.append('fotos', f)
      const { numero } = await crearEncargo(form)
      setListo({ numero, link: linkWhatsApp(mensajeEncargo(numero, datos.nombre, datos.tipoPrenda)) })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  const campo = (clave: keyof typeof datos) => ({
    value: datos[clave],
    onChange: (e: { target: { value: string } }) => setDatos((d) => ({ ...d, [clave]: e.target.value })),
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Titulo bajada="Contame qué prenda querés y la tejo a tu medida. Te paso presupuesto y fecha antes de empezar.">
        Encargos a medida
      </Titulo>

      <form onSubmit={enviar} className="space-y-5">
        <label className="block">
          <span className="font-semibold">¿Qué prenda querés?</span>
          <input className="campo mt-1" required list="prendas" placeholder="Ej: sweater, gorro…" {...campo('tipoPrenda')} />
          <datalist id="prendas">
            {PRENDAS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold">Talle</span>
            <input className="campo mt-1" placeholder="Ej: M, 4 años, adulto" {...campo('talle')} />
          </label>
          <label className="block">
            <span className="font-semibold">Fibra preferida</span>
            <input className="campo mt-1" placeholder="Ej: merino, alpaca, la que recomiendes" {...campo('fibra')} />
          </label>
        </div>
        <label className="block">
          <span className="font-semibold">Medidas (opcional)</span>
          <textarea className="campo mt-1 min-h-20" placeholder="Contorno de pecho, largo de manga…" {...campo('medidas')} />
        </label>
        <label className="block">
          <span className="font-semibold">Colores</span>
          <input className="campo mt-1" placeholder="Ej: crudo con detalles en terracota" {...campo('colores')} />
        </label>
        <label className="block">
          <span className="font-semibold">¿Para cuándo lo necesitás? (opcional)</span>
          <input className="campo mt-1" type="date" {...campo('fechaDeseada')} />
        </label>
        <label className="block">
          <span className="font-semibold">Algo más que quieras contarme</span>
          <textarea className="campo mt-1 min-h-24" {...campo('comentario')} />
        </label>
        <FotosInput
          etiqueta="Fotos de referencia (opcional)"
          ayuda="Un modelo que te guste, una paleta de colores, lo que sirva para entender la idea."
          fotos={fotos}
          onChange={setFotos}
        />

        <fieldset className="space-y-5 rounded-2xl bg-white/60 p-5">
          <legend className="sr-only">Tus datos</legend>
          <label className="block">
            <span className="font-semibold">Nombre</span>
            <input className="campo mt-1" required autoComplete="name" {...campo('nombre')} />
          </label>
          <label className="block">
            <span className="font-semibold">WhatsApp o teléfono</span>
            <input className="campo mt-1" required type="tel" autoComplete="tel" {...campo('telefono')} />
          </label>
          <label className="block">
            <span className="font-semibold">Zona (opcional)</span>
            <input className="campo mt-1" {...campo('zona')} />
          </label>
        </fieldset>

        {error && (
          <p className="text-terracota-oscuro" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton w-full" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar encargo'}
        </button>
      </form>
    </div>
  )
}
