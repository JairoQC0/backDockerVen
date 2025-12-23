// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: auth.js
// ═══════════════════════════════════════════════════════════════════════════════

import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { AppError } from "./errores.js";

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new AppError("No autorizado", 401, "NO_TOKEN"));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return next(new AppError("Token inválido", 401, "BAD_TOKEN"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return next(new AppError("No autorizado", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Prohibido", 403, "FORBIDDEN"));
    }
    next();
  };
}
