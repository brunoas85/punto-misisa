import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCarrito } from '../context/CartContext'

const LINKS = [
  { to: '/catalogo', texto: 'Catálogo' },
  { to: '/encargos', texto: 'Encargos' },
  { to: '/arreglos', texto: 'Arreglos' },
  { to: '/galeria', texto: 'Trabajos' },
  { to: '/sobre-mi', texto: 'Sobre mí' },
]

export function Header() {
  const { cantidadTotal } = useCarrito()
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-arena/60 bg-crudo/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* TODO: reemplazar el ovillo por el logo de Punto MISISA cuando esté */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setAbierto(false)}>
          <img src="/ovillo.svg" alt="" className="h-8 w-8" />
          <span className="flex flex-col leading-none">
            <span className="font-titulo text-xl font-semibold">Punto MISISA</span>
            <span className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-widest text-tinta-suave">
              Tejidos artesanales
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `font-semibold hover:text-terracota ${isActive ? 'text-terracota' : ''}`}
            >
              {l.texto}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to="/carrito"
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-lana"
            aria-label={`Carrito, ${cantidadTotal} ${cantidadTotal === 1 ? 'prenda' : 'prendas'}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {cantidadTotal > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracota px-1 text-xs font-bold text-crudo">
                {cantidadTotal}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-lana md:hidden"
            aria-expanded={abierto}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto((a) => !a)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="border-t border-arena/60 px-4 pb-4 md:hidden" aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center border-b border-arena/40 text-lg font-semibold ${isActive ? 'text-terracota' : ''}`
              }
            >
              {l.texto}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
