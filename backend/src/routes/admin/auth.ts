import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { login } from "../../schemas.js";

export const authRouter = Router();

const limite = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos, esperá unos minutos" },
});

authRouter.post("/login", limite, async (req, res) => {
  const { usuario, password } = login.parse(req.body);
  const admin = await prisma.admin.findUnique({ where: { usuario } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, "Usuario o contraseña incorrectos");
  }
  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET as string, { expiresIn: "30d" });
  res.json({ token });
});
