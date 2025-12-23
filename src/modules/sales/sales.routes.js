// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-17
// Archivo: sales.routes.js
// ═══════════════════════════════════════════════════════════════════════════════
import { Router } from "express";
import { authRequired } from "../../core/auth.js";
import { ok } from "../../core/respuestas.js";
import { salesService } from "./sales.service.js";
import { buildSalePdf } from "./sales.pdf.js";
import { prisma } from "../../core/prisma.js";

export const routerSales = Router();
routerSales.get("/", authRequired, async (req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      take: 50,
    });

    return ok(res, sales);
  } catch (error) {
    next(error);
  }
});

routerSales.post("/", authRequired, async (req, res, next) => {
  try {
    const sale = await salesService.create({
      storeId: req.body.storeId,
      userId: req.user.id,
      tipoDocumento: req.body.tipoDocumento,
      items: req.body.items,
    });
    return ok(res, sale, "Venta creada");
  } catch (e) {
    next(e);
  }
});

routerSales.put("/:id", authRequired, async (req, res, next) => {
  try {
    const sale = await salesService.update(req.params.id, {
      storeId: req.body.storeId,
      tipoDocumento: req.body.tipoDocumento,
      items: req.body.items,
    });
    return ok(res, sale, "Venta actualizada");
  } catch (e) {
    next(e);
  }
});

routerSales.post("/:id/anular", authRequired, async (req, res, next) => {
  try {
    const sale = await salesService.void(req.params.id);
    return ok(res, sale, "Venta anulada");
  } catch (e) {
    next(e);
  }
});

routerSales.get("/:id", authRequired, async (req, res, next) => {
  try {
    const sale = await salesService.getById(req.params.id);
    return ok(res, sale);
  } catch (e) {
    next(e);
  }
});

routerSales.get("/:id/pdf", authRequired, async (req, res, next) => {
  try {
    const sale = await salesService.getById(req.params.id);
    const pdfBuffer = await buildSalePdf(sale);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="venta-${sale.id}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (e) {
    next(e);
  }
});
