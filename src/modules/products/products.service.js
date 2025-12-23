// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: products.service.js
// ═══════════════════════════════════════════════════════════════════════════════

import { prisma } from "../../core/prisma.js";

export const productsService = {
  async list({ q, storeId }) {
    const where = {
      deletedAt: null,
      estado: "ACTIVO",
      ...(q ? { nombre: { contains: q, mode: "insensitive" } } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: "desc" },
      take: 50,
      include: storeId
        ? { stock: { where: { storeId: Number(storeId) } } }
        : { stock: true },
    });

    return products.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precioVenta: p.precioVenta,
      stock: p.stock?.[0]?.cantidad ?? null,
    }));
  },
};
