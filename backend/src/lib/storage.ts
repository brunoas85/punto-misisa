import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http.js";

export const BUCKET_PUBLICO = "productos";
export const BUCKET_PRIVADO = "solicitudes";

const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

let cliente: SupabaseClient | undefined;

function supabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new HttpError(503, "La subida de fotos todavía no está configurada");
  }
  cliente ??= createClient(url, key, { auth: { persistSession: false } });
  return cliente;
}

/** Sube un archivo y devuelve su ruta dentro del bucket. */
export async function subirFoto(
  bucket: string,
  carpeta: string,
  archivo: Express.Multer.File,
): Promise<string> {
  const ext = EXTENSIONES[archivo.mimetype] ?? "jpg";
  const ruta = `${carpeta}/${randomUUID()}.${ext}`;
  const { error } = await supabase()
    .storage.from(bucket)
    .upload(ruta, archivo.buffer, { contentType: archivo.mimetype });
  if (error) throw new HttpError(502, "No pudimos guardar la foto, probá de nuevo");
  return ruta;
}

export async function borrarFotos(bucket: string, rutas: string[]): Promise<void> {
  if (rutas.length === 0) return;
  await supabase().storage.from(bucket).remove(rutas);
}

/** URL pública de una foto del catálogo o la galería. */
export function urlPublica(ruta: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET_PUBLICO}/${ruta}`;
}

/** URL temporal para ver fotos privadas de encargos y arreglos (solo panel). */
export async function urlFirmada(ruta: string, segundos = 60 * 60): Promise<string | null> {
  const { data } = await supabase().storage.from(BUCKET_PRIVADO).createSignedUrl(ruta, segundos);
  return data?.signedUrl ?? null;
}
