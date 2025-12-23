// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: auth.routes.js
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from "express";
import { authService } from "./auth.service.js";
import { ok } from "../../core/respuestas.js";
import { authRequired } from "../../core/authRequired.js";

export const routerAuth = Router();

routerAuth.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ok(res, result, "Login correcto");
  } catch (error) {
    next(error);
  }
});

routerAuth.get("/test", (req, res) => {
  res.json({ ok: true, module: "auth" });
});

routerAuth.get("/me", authRequired, async (req, res) => {
  return ok(res, {
    user: req.user,
  });
});
