// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: env.js
// ═══════════════════════════════════════════════════════════════════════════════

import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

if (!env.DATABASE_URL) throw new Error("Falta DATABASE_URL en .env");
if (!env.JWT_SECRET) throw new Error("Falta JWT_SECRET en .env");
