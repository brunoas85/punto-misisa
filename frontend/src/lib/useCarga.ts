import { useEffect, useState } from 'react'

interface Carga<T> {
  datos: T | undefined
  error: string | undefined
  cargando: boolean
}

/** Carga datos al montar y cada vez que cambian las dependencias; ignora respuestas viejas. */
export function useCarga<T>(cargar: () => Promise<T>, deps: unknown[]): Carga<T> & { recargar: () => void } {
  const [estado, setEstado] = useState<Carga<T>>({ datos: undefined, error: undefined, cargando: true })
  const [vuelta, setVuelta] = useState(0)

  useEffect(() => {
    let vigente = true
    setEstado((e) => ({ ...e, cargando: true, error: undefined }))
    cargar()
      .then((datos) => vigente && setEstado({ datos, error: undefined, cargando: false }))
      .catch((e: Error) => vigente && setEstado({ datos: undefined, error: e.message, cargando: false }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, vuelta])

  return { ...estado, recargar: () => setVuelta((v) => v + 1) }
}
