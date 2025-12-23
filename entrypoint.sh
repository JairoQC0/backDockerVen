#!/bin/sh
set -e

echo "⏳ Esperando a la base de datos..."
sleep 5

echo "📦 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed (si existe)..."
if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Ejecutando seed (entorno no productivo)..."
  npx prisma db seed || echo "Seed omitido"
else
  echo "🚫 Seed deshabilitado en producción"
fi


echo "🚀 Iniciando backend..."
npm run start
