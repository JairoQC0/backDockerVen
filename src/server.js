// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: server.js
// ═══════════════════════════════════════════════════════════════════════════════

import { app } from "./app.js";
import { env } from "./core/env.js";

app.listen(env.PORT, () => {
  console.log(`API en http://localhost:${env.PORT}`);
});
