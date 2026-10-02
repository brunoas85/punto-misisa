import type { EstadoPedido } from "@prisma/client";
import type { z } from "zod";
import { HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import type { nuevoPedido } from "../schemas.js";
import { validarTransicionPedido } from "./estados.js";

type NuevoPedido = z.infer<typeof nuevoPedido>;

/**
 * Crea un pedido `pendiente`. Valida stock pero no lo reserva: el stock se
 * descuenta recién cuando la tejedora lo confirma (ver `cambiarEstadoPedido`).
 * Los precios salen siempre de la base, nunca del cliente.
 */
export async function crearPedido({ cliente, items }: NuevoPedido) {
  const cantidades = new Map<string, number>();
  for (const { productoId, cantidad } of items) {
    cantidades.set(productoId, (cantidades.get(productoId) ?? 0) + cantidad);
  }

  const productos = await prisma.producto.findMany({
    where: { id: { in: [...cantidades.keys()] }, visible: true },
  });

  const lineas = [...cantidades].map(([productoId, cantidad]) => {
    const p = productos.find((x) => x.id === productoId);
    if (!p) throw new HttpError(400, "Uno de los productos ya no está disponible");
    if (p.disponibilidad !== "disponible" || p.precio === null) {
      throw new HttpError(400, `"${p.nombre}" se hace por encargo: pedilo desde la sección Encargos`);
    }
    if (p.stock < cantidad) {
      throw new HttpError(409, p.stock === 0 ? `"${p.nombre}" ya se vendió` : `De "${p.nombre}" quedan ${p.stock}`);
    }
    return { productoId, nombreProducto: p.nombre, precioUnitario: p.precio, cantidad };
  });

  const total = lineas.reduce((suma, l) => suma + l.precioUnitario * l.cantidad, 0);

  return prisma.pedido.create({
    data: { ...cliente, total, items: { create: lineas } },
    include: { items: true },
  });
}

/** Cambia estado/notas. Confirmar descuenta stock; cancelar un confirmado lo devuelve. */
export async function actualizarPedido(
  id: string,
  cambios: { estado?: EstadoPedido; notas?: string | null },
) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({ where: { id }, include: { items: true } });
    if (!pedido) throw new HttpError(404, "No encontramos ese pedido");

    const nuevo = cambios.estado ?? pedido.estado;
    validarTransicionPedido(pedido.estado, nuevo);

    if (pedido.estado !== "confirmado" && nuevo === "confirmado") {
      for (const item of pedido.items) {
        // Condicional para que dos confirmaciones simultáneas no vendan la misma pieza
        const { count } = await tx.producto.updateMany({
          where: { id: item.productoId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (count === 0) {
          throw new HttpError(409, `No alcanza el stock de "${item.nombreProducto}"`);
        }
      }
    }

    if (pedido.estado === "confirmado" && nuevo === "cancelado") {
      for (const item of pedido.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }
    }

    return tx.pedido.update({
      where: { id },
      data: { estado: nuevo, notas: cambios.notas },
      include: { items: true },
    });
  });
}
