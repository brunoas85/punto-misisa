import "dotenv/config";
import { app } from "./app.js";

if (!process.env.JWT_SECRET) {
  throw new Error("Falta JWT_SECRET en el .env");
}

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`API de Punto MISISA escuchando en http://localhost:${port}`);
});
