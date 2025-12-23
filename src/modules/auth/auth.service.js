// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: auth.service.js
// ═══════════════════════════════════════════════════════════════════════════════

import bcrypt from "bcrypt";
import { prisma } from "../../core/prisma.js";
import { AppError } from "../../core/errores.js";
import { signToken } from "../../core/auth.js";

export const authService = {
  async login(email, password) {
    if (!email || !password) {
      throw new AppError("Email y password son obligatorios", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.estado !== "ACTIVO") {
      throw new AppError("Credenciales inválidas", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      nombre: user.nombre,
    });

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    };
  },
};
