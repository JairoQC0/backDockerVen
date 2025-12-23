// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: app.js
// ═══════════════════════════════════════════════════════════════════════════════

import express from "express";
import cors from "cors";
import { errorMiddleware } from "./core/errores.js";

import { routerAuth } from "./modules/auth/auth.routes.js";
import { routerProducts } from "./modules/products/products.routes.js";
import { routerSales } from "./modules/sales/sales.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, status: "OK" }));

app.use("/api/auth", routerAuth);
app.use("/api/products", routerProducts);
app.use("/api/sales", routerSales);

app.use(errorMiddleware);
