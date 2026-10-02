import { leer } from '../lib/storage'

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`
export const CLAVE_TOKEN = 'misisa.admin.token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Fetch contra la API. Agrega el token del panel si hay uno y traduce `{ error }` a ApiError. */
export async function api<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = leer(CLAVE_TOKEN)
  if (token && ruta.startsWith('/admin')) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${BASE}${ruta}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.')
  }

  if (res.status === 204) return undefined as T
  const datos = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && ruta.startsWith('/admin')) window.dispatchEvent(new Event('misisa:sesion-vencida'))
    throw new ApiError(res.status, datos?.error ?? 'Algo salió mal, probá de nuevo en un rato')
  }
  return datos as T
}

export const json = (cuerpo: unknown) => JSON.stringify(cuerpo)
