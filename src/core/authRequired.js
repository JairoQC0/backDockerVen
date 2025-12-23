// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: authRequired.js
// ═══════════════════════════════════════════════════════════════════════════════

import jwt from "jsonwebtoken";
import { AppError } from "./errores.js";

export function authRequired(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    throw new AppError("No autorizado", 401);
  }

  const token = auth.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    throw new AppError("Token inválido", 401);
  }
}
