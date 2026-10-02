import { useEffect, useMemo, useRef } from 'react'

interface Props {
  fotos: File[]
  onChange: (fotos: File[]) => void
  max?: number
  etiqueta: string
  ayuda?: string
}

/** Selector de fotos con preview. No comprime: eso se hace al enviar. */
export function FotosInput({ fotos, onChange, max = 5, etiqueta, ayuda }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  function agregar(lista: FileList | null) {
    if (!lista) return
    onChange([...fotos, ...Array.from(lista)].slice(0, max))
    if (input.current) input.current.value = ''
  }

  return (
    <fieldset>
      <legend className="font-semibold">{etiqueta}</legend>
      {ayuda && <p className="text-sm text-tinta-suave">{ayuda}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {previews.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl bg-lana">
            <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(fotos.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-tinta/80 text-crudo"
              aria-label={`Quitar foto ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        {fotos.length < max && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-arena text-sm text-tinta-suave hover:border-terracota hover:text-terracota">
            <span className="text-2xl leading-none">+</span>
            Agregar
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => agregar(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-tinta-suave">
        {fotos.length}/{max} fotos
      </p>
    </fieldset>
  )
}
