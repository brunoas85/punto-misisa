import { Link } from 'react-router-dom'

interface Props {
  titulo: string
  texto: string
  linkWhatsApp: string
}

/** Pantalla final de pedido, encargo o arreglo: el siguiente paso siempre es WhatsApp. */
export function Confirmacion({ titulo, texto, linkWhatsApp }: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <img src="/ovillo.svg" alt="" className="mx-auto h-16 w-16" />
      <h1 className="mt-6 text-3xl font-semibold">{titulo}</h1>
      <p className="mt-3 text-tinta-suave">{texto}</p>
      <a href={linkWhatsApp} target="_blank" rel="noreferrer" className="boton mt-8 w-full sm:w-auto">
        Seguir por WhatsApp
      </a>
      <p className="mt-6">
        <Link to="/catalogo" className="text-sm underline hover:text-terracota">
          Volver al catálogo
        </Link>
      </p>
    </div>
  )
}
