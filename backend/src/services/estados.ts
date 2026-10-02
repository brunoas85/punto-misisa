import type { EstadoPedido, EstadoSolicitud } from "@prisma/client";
import { HttpError } from "../lib/http.js";

const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

const TRANSICIONES_SOLICITUD: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  nuevo: ["presupuestado", "cancelado"],
  presupuestado: ["en_proceso", "cancelado"],
  en_proceso: ["listo", "cancelado"],
  listo: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

const ETIQUETAS: Record<EstadoPedido | EstadoSolicitud, string> = {
  pendiente: "pendiente",
  confirmado: "confirmado",
  entregado: "entregado",
  cancelado: "cancelado",
  nuevo: "nuevo",
  presupuestado: "presupuestado",
  en_proceso: "en proceso",
  listo: "listo",
};

function validar<E extends string>(mapa: Record<E, E[]>, actual: E, nuevo: E) {
  if (actual === nuevo) return;
  if (!mapa[actual].includes(nuevo)) {
    throw new HttpError(
      409,
      `No se puede pasar de "${ETIQUETAS[actual as keyof typeof ETIQUETAS]}" a "${ETIQUETAS[nuevo as keyof typeof ETIQUETAS]}"`,
    );
  }
}

export function validarTransicionPedido(actual: EstadoPedido, nuevo: EstadoPedido) {
  validar(TRANSICIONES_PEDIDO, actual, nuevo);
}

export function validarTransicionSolicitud(actual: EstadoSolicitud, nuevo: EstadoSolicitud) {
  validar(TRANSICIONES_SOLICITUD, actual, nuevo);
}
