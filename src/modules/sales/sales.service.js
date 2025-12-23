// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: sales.service.js
// ═══════════════════════════════════════════════════════════════════════════════

import { prisma } from "../../core/prisma.js";
import { AppError } from "../../core/errores.js";

function calcTotals(items) {
  let subtotal = 0;
  const norm = items.map((it) => {
    const cantidad = Number(it.cantidad);
    const precio = Number(it.precio);
    if (!it.productId || cantidad <= 0 || precio <= 0) {
      throw new AppError("Item inválido (productId, cantidad, precio)", 400);
    }
    const sub = +(cantidad * precio).toFixed(2);
    subtotal += sub;
    return { productId: Number(it.productId), cantidad, precio, subtotal: sub };
  });
  subtotal = +subtotal.toFixed(2);
  const total = subtotal;
  return { items: norm, subtotal, total };
}

export const salesService = {
  async create({ storeId, userId, tipoDocumento, items }) {
    if (!storeId || !userId)
      throw new AppError("storeId y userId requeridos", 400);
    if (!tipoDocumento) throw new AppError("tipoDocumento requerido", 400);
    if (!Array.isArray(items) || items.length === 0)
      throw new AppError("items requeridos", 400);

    const { items: normItems, subtotal, total } = calcTotals(items);

    return prisma.$transaction(async (tx) => {
      for (const it of normItems) {
        const stock = await tx.productStock.findUnique({
          where: {
            productId_storeId: {
              productId: it.productId,
              storeId: Number(storeId),
            },
          },
        });
        if (!stock)
          throw new AppError(
            `Sin stock configurado para productId ${it.productId}`,
            400
          );
        if (stock.cantidad < it.cantidad)
          throw new AppError(
            `Stock insuficiente para productId ${it.productId}`,
            400
          );
      }

      const sale = await tx.sale.create({
        data: {
          storeId: Number(storeId),
          userId: Number(userId),
          tipoDocumento,
          subtotal,
          total,
        },
      });

      for (const it of normItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: it.productId,
            cantidad: it.cantidad,
            precio: it.precio,
            subtotal: it.subtotal,
          },
        });

        await tx.productStock.update({
          where: {
            productId_storeId: {
              productId: it.productId,
              storeId: Number(storeId),
            },
          },
          data: { cantidad: { decrement: it.cantidad } },
        });
      }

      return sale;
    });
  },

  async update(saleId, { storeId, tipoDocumento, items }) {
    const id = Number(saleId);
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!sale || sale.deletedAt) throw new AppError("Venta no encontrada", 404);
    if (sale.estado !== "ACTIVA")
      throw new AppError("Solo se puede editar ventas ACTIVAS", 400);

    const { items: normItems, subtotal, total } = calcTotals(items);

    return prisma.$transaction(async (tx) => {
      for (const old of sale.items) {
        await tx.productStock.update({
          where: {
            productId_storeId: {
              productId: old.productId,
              storeId: sale.storeId,
            },
          },
          data: { cantidad: { increment: old.cantidad } },
        });
      }

      await tx.saleItem.deleteMany({ where: { saleId: id } });

      for (const it of normItems) {
        const stock = await tx.productStock.findUnique({
          where: {
            productId_storeId: {
              productId: it.productId,
              storeId: sale.storeId,
            },
          },
        });
        if (!stock || stock.cantidad < it.cantidad) {
          throw new AppError(
            `Stock insuficiente para productId ${it.productId}`,
            400
          );
        }
      }

      for (const it of normItems) {
        await tx.saleItem.create({
          data: {
            saleId: id,
            productId: it.productId,
            cantidad: it.cantidad,
            precio: it.precio,
            subtotal: it.subtotal,
          },
        });
        await tx.productStock.update({
          where: {
            productId_storeId: {
              productId: it.productId,
              storeId: sale.storeId,
            },
          },
          data: { cantidad: { decrement: it.cantidad } },
        });
      }

      const updated = await tx.sale.update({
        where: { id },
        data: {
          tipoDocumento: tipoDocumento ?? sale.tipoDocumento,
          subtotal,
          total,
          storeId: storeId ? Number(storeId) : sale.storeId,
        },
      });

      return updated;
    });
  },

  async void(saleId) {
    const id = Number(saleId);

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!sale || sale.deletedAt) throw new AppError("Venta no encontrada", 404);
    if (sale.estado !== "ACTIVA") throw new AppError("Venta ya anulada", 400);

    return prisma.$transaction(async (tx) => {
      for (const it of sale.items) {
        await tx.productStock.update({
          where: {
            productId_storeId: {
              productId: it.productId,
              storeId: sale.storeId,
            },
          },
          data: { cantidad: { increment: it.cantidad } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { estado: "ANULADA", deletedAt: new Date() },
      });
    });
  },

  async getById(saleId) {
    const id = Number(saleId);
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!sale || sale.deletedAt) throw new AppError("Venta no encontrada", 404);
    return sale;
  },
};
