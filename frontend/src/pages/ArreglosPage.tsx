import { useState, type FormEvent } from 'react'
import { crearArreglo } from '../api/publico'
import { Confirmacion } from '../components/Confirmacion'
import { Titulo } from '../components/Estado'
import { FotosInput } from '../components/FotosInput'
import { comprimir } from '../lib/imagenes'
import { linkWhatsApp, mensajeArreglo } from '../lib/whatsapp'

export function ArreglosPage() {
  const [datos, setDatos] = useState({ nombre: '', telefono: '', zona: '', tipoPrenda: '', descripcion: '' })
  const [fotos, setFotos] = useState<File[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string>()
  const [listo, setListo] = useState<{ numero: number; link: string }>()

  if (listo) {
    return (
      <Confirmacion
        titulo={`¡Consulta #${listo.numero} recibida!`}
        texto="Miro las fotos y te paso presupuesto. Escribime por WhatsApp para coordinar cómo me hacés llegar la prenda."
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
      for (const f of await Promise.all(fotos.map(comprimir))) form.append('fotos', f)
      const { numero } = await crearArreglo(form)
      setListo({ numero, link: linkWhatsApp(mensajeArreglo(numero, datos.nombre, datos.tipoPrenda)) })
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
      <Titulo bajada="Zurcidos, agujeros, puños gastados, achicar o agrandar. Mandame fotos y te digo si tiene arreglo y cuánto sale.">
        Arreglos de tejidos
      </Titulo>

      <form onSubmit={enviar} className="space-y-5">
        <label className="block">
          <span className="font-semibold">¿Qué prenda es?</span>
          <input className="campo mt-1" required placeholder="Ej: sweater de lana" {...campo('tipoPrenda')} />
        </label>
        <label className="block">
          <span className="font-semibold">¿Qué hay que arreglar?</span>
          <textarea
            className="campo mt-1 min-h-28"
            required
            placeholder="Ej: tiene un agujero en el codo y los puños están deshilachados"
            {...campo('descripcion')}
          />
        </label>
        <FotosInput
          etiqueta="Fotos del daño"
          ayuda="Muy recomendadas: una de la prenda entera y otra de cerca de la parte a arreglar."
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
          {enviando ? 'Enviando…' : 'Enviar consulta'}
        </button>
      </form>
    </div>
  )
}
