import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const SECCIONES = [
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/encargos', texto: 'Encargos' },
  { to: '/admin/arreglos', texto: 'Arreglos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/galeria', texto: 'Galería' },
]

/** Protege todo /admin/* y arma la navegación del panel (pensada para el celular). */
export function AdminLayout() {
  const { logueada, salir } = useAdminAuth()
  if (!logueada) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-arena/60 bg-crudo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <span className="font-titulo text-lg font-semibold">Panel</span>
          <button type="button" onClick={salir} className="min-h-11 text-sm underline">
            Salir
          </button>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-2 pb-2" aria-label="Panel">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `flex min-h-11 shrink-0 items-center rounded-full px-4 font-semibold ${isActive ? 'bg-tinta text-crudo' : 'hover:bg-lana'}`
              }
            >
              {s.texto}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export function EnConstruccion({ titulo }: { titulo: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="mt-2 text-tinta-suave">Esta sección está en construcción.</p>
    </div>
  )
}
