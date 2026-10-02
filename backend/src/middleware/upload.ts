import multer from "multer";
import { HttpError } from "../lib/http.js";

export const MAX_FOTOS = 5;
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Fotos en memoria (se suben a Supabase Storage, nunca al disco). */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: MAX_FOTOS },
  fileFilter: (_req, file, cb) => {
    if (TIPOS.has(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Solo se aceptan fotos JPG, PNG o WebP"));
  },
});
