const LADO_MAX = 1600
const CALIDAD = 0.82

/**
 * Achica la foto en el navegador antes de subirla (las del celular pesan varios MB).
 * Si algo falla, devuelve el archivo original.
 */
export async function comprimir(archivo: File): Promise<File> {
  if (!archivo.type.startsWith('image/')) return archivo
  try {
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', CALIDAD))
    if (!blob || blob.size >= archivo.size) return archivo
    return new File([blob], archivo.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return archivo
  }
}
