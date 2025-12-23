// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa
// Fecha:   2025-12-16
// Archivo: seed.js
// ═══════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      nombre: "Tienda Central",
    },
  });

  console.log("Store creada:", store.nombre);

  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      nombre: "Administrador",
      email: "admin@demo.com",
      password: passwordHash,
      role: "ADMIN",
      estado: "ACTIVO",
    },
  });

  console.log("Admin creado:", admin.email);

  const producto1 = await prisma.product.create({
    data: {
      nombre: "Coca Cola 500ml",
      precioVenta: 3.5,
      estado: "ACTIVO",
    },
  });

  const producto2 = await prisma.product.create({
    data: {
      nombre: "Inca Kola 500ml",
      precioVenta: 3.5,
      estado: "ACTIVO",
    },
  });

  console.log("Productos creados");

  await prisma.productStock.createMany({
    data: [
      {
        productId: producto1.id,
        storeId: store.id,
        cantidad: 100,
      },
      {
        productId: producto2.id,
        storeId: store.id,
        cantidad: 80,
      },
    ],
  });

  console.log("Stock creado");

  console.log("✅ Seed ejecutada correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
