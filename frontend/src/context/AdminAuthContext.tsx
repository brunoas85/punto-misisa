import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as loginApi } from '../api/admin'
import { CLAVE_TOKEN } from '../api/client'
import { guardar, leer } from '../lib/storage'

interface AdminAuth {
  logueada: boolean
  entrar: (usuario: string, password: string) => Promise<void>
  salir: () => void
}

const AdminAuthContext = createContext<AdminAuth | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leer(CLAVE_TOKEN))

  function salir() {
    guardar(CLAVE_TOKEN, null)
    setToken(null)
  }

  // El cliente HTTP avisa cuando el backend responde 401
  useEffect(() => {
    window.addEventListener('misisa:sesion-vencida', salir)
    return () => window.removeEventListener('misisa:sesion-vencida', salir)
  }, [])

  async function entrar(usuario: string, password: string) {
    const { token } = await loginApi(usuario, password)
    guardar(CLAVE_TOKEN, token)
    setToken(token)
  }

  return <AdminAuthContext.Provider value={{ logueada: !!token, entrar, salir }}>{children}</AdminAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth tiene que usarse dentro de <AdminAuthProvider>')
  return ctx
}
