import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIAS = [
  { nombre: "Gorros", slug: "gorros", orden: 1 },
  { nombre: "Chalecos", slug: "chalecos", orden: 2 },
  { nombre: "Sweaters", slug: "sweaters", orden: 3 },
  { nombre: "Medias", slug: "medias", orden: 4 },
  { nombre: "Otras confecciones", slug: "otras-confecciones", orden: 5 },
];

async function main() {
  const usuario = process.env.ADMIN_USUARIO ?? "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("Definí ADMIN_PASSWORD en el .env para crear el usuario del panel");

  await prisma.admin.upsert({
    where: { usuario },
    update: {},
    create: { usuario, passwordHash: await bcrypt.hash(password, 10) },
  });

  for (const c of CATEGORIAS) {
    await prisma.categoria.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // Productos de ejemplo (sin fotos) para ver el catálogo andando; borralos desde el panel
  const gorros = await prisma.categoria.findUniqueOrThrow({ where: { slug: "gorros" } });
  const sweaters = await prisma.categoria.findUniqueOrThrow({ where: { slug: "sweaters" } });

  await prisma.producto.upsert({
    where: { slug: "gorro-trenzado-crudo" },
    update: {},
    create: {
      nombre: "Gorro trenzado crudo",
      slug: "gorro-trenzado-crudo",
      descripcion: "Gorro con trenzas y pompón, tejido a mano en lana de oveja.",
      categoriaId: gorros.id,
      precio: 18000,
      stock: 1,
      fibra: "Lana de oveja",
      talles: ["Adulto"],
      colores: ["Crudo"],
      cuidados: "Lavar a mano con agua fría y secar en horizontal, a la sombra.",
      destacado: true,
    },
  });

  await prisma.producto.upsert({
    where: { slug: "sweater-cuello-alto" },
    update: {},
    create: {
      nombre: "Sweater cuello alto",
      slug: "sweater-cuello-alto",
      descripcion: "Sweater amplio de cuello alto. Se teje a pedido en tu talle y color.",
      categoriaId: sweaters.id,
      precio: null,
      disponibilidad: "por_encargo",
      diasConfeccion: 20,
      fibra: "Merino",
      talles: ["S", "M", "L", "XL"],
      colores: ["Crudo", "Gris", "Terracota", "Verde oliva"],
    },
  });

  console.log("Seed listo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
