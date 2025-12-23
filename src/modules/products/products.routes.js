// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: products.routes.js
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from "express";
import { authRequired } from "../../core/authRequired.js";
import { ok } from "../../core/respuestas.js";
import { prisma } from "../../core/prisma.js";
import { AppError } from "../../core/errores.js";

export const routerProducts = Router();

routerProducts.get("/", authRequired, async (req, res, next) => {
  try {
    const storeId = Number(req.query.storeId);
    if (!storeId) {
      throw new AppError("storeId es requerido", 400);
    }

    const products = await prisma.product.findMany({
      where: { estado: "ACTIVO" },
      include: {
        stock: {
          where: { storeId },
        },
      },
    });

    const result = products.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precioVenta: p.precioVenta,
      stock: p.stock[0]?.cantidad ?? 0,
    }));

    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

routerProducts.post("/", authRequired, async (req, res, next) => {
  try {
    const { nombre, precioVenta, stock, storeId } = req.body;

    if (!nombre || !precioVenta || !storeId) {
      throw new AppError("Datos incompletos", 400);
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          nombre,
          precioVenta,
          estado: "ACTIVO",
        },
      });

      await tx.productStock.create({
        data: {
          productId: p.id,
          storeId,
          cantidad: stock ?? 0,
        },
      });

      return p;
    });

    return ok(res, product, "Producto creado");
  } catch (e) {
    next(e);
  }
});

routerProducts.put("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, precioVenta } = req.body;

    await prisma.product.update({
      where: { id },
      data: { nombre, precioVenta },
    });

    return ok(res, null, "Producto actualizado");
  } catch (e) {
    next(e);
  }
});

routerProducts.post("/:id/desactivar", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });

    return ok(res, null, "Producto desactivado");
  } catch (e) {
    next(e);
  }
});

routerProducts.post("/:id/stock", authRequired, async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const { storeId, cantidad } = req.body;

    if (!storeId || typeof cantidad !== "number") {
      throw new AppError("Datos incompletos", 400);
    }

    await prisma.productStock.update({
      where: {
        productId_storeId: {
          productId,
          storeId,
        },
      },
      data: {
        cantidad: {
          increment: cantidad,
        },
      },
    });

    return ok(res, null, "Stock actualizado");
  } catch (e) {
    next(e);
  }
});

routerProducts.post("/import", authRequired, async (req, res, next) => {
  try {
    const { storeId, products } = req.body;

    if (!storeId || !Array.isArray(products)) {
      throw new AppError("Datos inválidos", 400);
    }

    await prisma.$transaction(async (tx) => {
      for (const p of products) {
        const product = await tx.product.create({
          data: {
            nombre: p.nombre,
            precioVenta: p.precioVenta,
            estado: "ACTIVO",
          },
        });

        await tx.productStock.create({
          data: {
            productId: product.id,
            storeId,
            cantidad: p.stock,
          },
        });
      }
    });

    return ok(res, null, "Productos importados");
  } catch (e) {
    next(e);
  }
});
