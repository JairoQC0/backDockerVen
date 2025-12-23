#!/bin/sh
set -e

echo "⏳ Esperando a la base de datos..."
sleep 5

echo "📦 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed (si existe)..."
npx prisma db seed || echo "Seed omitido"

echo "🚀 Iniciando backend..."
npm run start
