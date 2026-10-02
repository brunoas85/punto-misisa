import type { ReactNode } from 'react'

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <p className="py-16 text-center text-tinta-suave" role="status">
      {texto}
    </p>
  )
}

export function MensajeError({ children, reintentar }: { children: ReactNode; reintentar?: () => void }) {
  return (
    <div className="my-8 rounded-2xl border border-terracota/30 bg-terracota/5 p-6 text-center" role="alert">
      <p>{children}</p>
      {reintentar && (
        <button type="button" className="boton-secundario mt-4" onClick={reintentar}>
          Probar de nuevo
        </button>
      )}
    </div>
  )
}

export function Titulo({ children, bajada }: { children: ReactNode; bajada?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">{children}</h1>
      {bajada && <p className="mt-2 max-w-2xl text-tinta-suave">{bajada}</p>}
    </div>
  )
}
