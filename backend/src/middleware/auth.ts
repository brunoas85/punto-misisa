import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  adminId?: string;
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Tenés que iniciar sesión" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { adminId: string };
    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ error: "La sesión venció, volvé a entrar" });
  }
}
