import cors from "cors";
import express from "express";
import { requireAdmin } from "./middleware/auth.js";
import { manejarErrores } from "./middleware/errores.js";
import { authRouter } from "./routes/admin/auth.js";
import { bandejasRouter } from "./routes/admin/bandejas.js";
import { catalogoAdminRouter } from "./routes/admin/catalogo.js";
import { catalogoRouter } from "./routes/publico/catalogo.js";
import { solicitudesRouter } from "./routes/publico/solicitudes.js";

export const app = express();

const origenes = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",").map((o) => o.trim());

app.set("trust proxy", 1); // detrás del proxy de Render, para que el rate limit vea la IP real
app.use(cors({ origin: origenes }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", catalogoRouter);
app.use("/api", solicitudesRouter);
app.use("/api/admin", authRouter);
app.use("/api/admin", requireAdmin, catalogoAdminRouter);
app.use("/api/admin", requireAdmin, bandejasRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta inexistente" });
});

app.use(manejarErrores);
