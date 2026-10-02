import { Link } from 'react-router-dom'
import { linkConsulta } from '../lib/whatsapp'

export function Footer() {
  return (
    <footer className="mt-20 bg-tinta text-crudo/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-titulo text-xl text-crudo">Punto MISISA</p>
          <p className="mt-2 text-sm">Prendas tejidas 100% a mano, una por una.</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Secundaria">
          <Link to="/catalogo" className="hover:text-crudo">Catálogo</Link>
          <Link to="/encargos" className="hover:text-crudo">Encargos a medida</Link>
          <Link to="/arreglos" className="hover:text-crudo">Arreglos</Link>
          <Link to="/preguntas-frecuentes" className="hover:text-crudo">Preguntas frecuentes</Link>
        </nav>
        <div className="text-sm">
          <a href={linkConsulta()} target="_blank" rel="noreferrer" className="font-semibold text-crudo hover:underline">
            Escribinos por WhatsApp
          </a>
          <p className="mt-2">Envíos y entregas a coordinar.</p>
        </div>
      </div>
      <p className="border-t border-crudo/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} Punto MISISA. Todos los derechos reservados.
      </p>
    </footer>
  )
}
