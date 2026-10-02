import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export function LoginPage() {
  const { logueada, entrar } = useAdminAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string>()

  if (logueada) return <Navigate to="/admin" replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(undefined)
    try {
      await entrar(usuario, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl bg-white/70 p-8">
        <img src="/ovillo.svg" alt="" className="mx-auto h-12 w-12" />
        <h1 className="text-center text-2xl font-semibold">Panel</h1>
        <label className="block">
          <span className="font-semibold">Usuario</span>
          <input className="campo mt-1" required autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </label>
        <label className="block">
          <span className="font-semibold">Contraseña</span>
          <input
            className="campo mt-1"
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="text-terracota-oscuro" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton w-full" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
