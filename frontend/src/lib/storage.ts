// localStorage puede no existir o tirar (modo privado, cookies bloqueadas): nunca dependemos de él.

export function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function guardar(clave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, valor)
  } catch {
    /* sin persistencia, seguimos igual */
  }
}
