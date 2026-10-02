import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { guardar, leer } from '../lib/storage'
import type { Producto } from '../types'

export interface ItemCarrito {
  productoId: string
  slug: string
  nombre: string
  precio: number
  foto?: string
  stock: number
  cantidad: number
}

interface Carrito {
  items: ItemCarrito[]
  cantidadTotal: number
  subtotal: number
  /** Devuelve false si no se pudo (sin precio o sin stock suficiente). */
  agregar: (p: Producto) => boolean
  cambiarCantidad: (productoId: string, cantidad: number) => void
  quitar: (productoId: string) => void
  vaciar: () => void
}

const CLAVE = 'misisa.carrito'
const CarritoContext = createContext<Carrito | null>(null)

function cargarGuardado(): ItemCarrito[] {
  try {
    const datos = JSON.parse(leer(CLAVE) ?? '[]')
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(cargarGuardado)

  useEffect(() => {
    guardar(CLAVE, JSON.stringify(items))
  }, [items])

  function agregar(p: Producto): boolean {
    if (p.precio === null || p.disponibilidad !== 'disponible') return false
    const actual = items.find((i) => i.productoId === p.id)
    if ((actual?.cantidad ?? 0) >= p.stock) return false
    setItems((prev) =>
      actual
        ? prev.map((i) => (i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1, stock: p.stock } : i))
        : [
            ...prev,
            {
              productoId: p.id,
              slug: p.slug,
              nombre: p.nombre,
              precio: p.precio as number,
              foto: p.fotos[0]?.url,
              stock: p.stock,
              cantidad: 1,
            },
          ],
    )
    return true
  }

  function cambiarCantidad(productoId: string, cantidad: number) {
    setItems((prev) =>
      prev.map((i) => (i.productoId === productoId ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) } : i)),
    )
  }

  const quitar = (productoId: string) => setItems((prev) => prev.filter((i) => i.productoId !== productoId))
  const vaciar = () => setItems([])

  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0)
  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio, 0)

  return (
    <CarritoContext.Provider value={{ items, cantidadTotal, subtotal, agregar, cambiarCantidad, quitar, vaciar }}>
      {children}
    </CarritoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito tiene que usarse dentro de <CartProvider>')
  return ctx
}
