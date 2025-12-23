// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: errores.js
// ═══════════════════════════════════════════════════════════════════════════════

export class AppError extends Error {
  constructor(message, status = 400, code = "APP_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Error interno",
  });
}
