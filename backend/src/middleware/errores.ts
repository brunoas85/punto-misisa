import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { HttpError } from "../lib/http.js";

const MENSAJES_MULTER: Partial<Record<MulterError["code"], string>> = {
  LIMIT_FILE_SIZE: "Cada foto puede pesar hasta 8 MB",
  LIMIT_FILE_COUNT: "Podés subir hasta 5 fotos",
  LIMIT_UNEXPECTED_FILE: "Podés subir hasta 5 fotos",
};

export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message ?? "Datos inválidos" });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof MulterError) {
    return res.status(400).json({ error: MENSAJES_MULTER[err.code] ?? "No pudimos leer las fotos" });
  }
  console.error(err);
  return res.status(500).json({ error: "Algo salió mal, probá de nuevo en un rato" });
}
