// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: respuestas.js
// ═══════════════════════════════════════════════════════════════════════════════

export function ok(res, data = null, message = "OK") {
  return res.json({ ok: true, message, data });
}
