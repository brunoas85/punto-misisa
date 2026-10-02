import { describe, expect, it } from "vitest";
import { HttpError } from "../lib/http.js";
import { validarTransicionPedido, validarTransicionSolicitud } from "./estados.js";

describe("transiciones de pedido", () => {
  it("permite el camino normal", () => {
    expect(() => validarTransicionPedido("pendiente", "confirmado")).not.toThrow();
    expect(() => validarTransicionPedido("confirmado", "entregado")).not.toThrow();
  });

  it("permite cancelar antes de entregar", () => {
    expect(() => validarTransicionPedido("pendiente", "cancelado")).not.toThrow();
    expect(() => validarTransicionPedido("confirmado", "cancelado")).not.toThrow();
  });

  it("rechaza saltos y vueltas atrás con 409", () => {
    for (const [de, a] of [
      ["pendiente", "entregado"],
      ["entregado", "pendiente"],
      ["cancelado", "confirmado"],
    ] as const) {
      expect(() => validarTransicionPedido(de, a)).toThrow(HttpError);
      try {
        validarTransicionPedido(de, a);
      } catch (e) {
        expect((e as HttpError).status).toBe(409);
      }
    }
  });

  it("dejar el mismo estado no es un error", () => {
    expect(() => validarTransicionPedido("entregado", "entregado")).not.toThrow();
  });
});

describe("transiciones de encargos y arreglos", () => {
  it("sigue nuevo → presupuestado → en_proceso → listo → entregado", () => {
    const camino = ["nuevo", "presupuestado", "en_proceso", "listo", "entregado"] as const;
    for (let i = 0; i < camino.length - 1; i++) {
      expect(() => validarTransicionSolicitud(camino[i], camino[i + 1])).not.toThrow();
    }
  });

  it("no deja saltear el presupuesto", () => {
    expect(() => validarTransicionSolicitud("nuevo", "en_proceso")).toThrow(HttpError);
  });

  it("no deja cancelar algo entregado", () => {
    expect(() => validarTransicionSolicitud("entregado", "cancelado")).toThrow(HttpError);
  });
});
