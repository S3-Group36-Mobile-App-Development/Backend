#!/bin/sh
# Arranque del backend de ZenMind en producción (Render / Docker).
# 1. Aplica las migraciones pendientes.
# 2. Siembra los catálogos base (idempotente: no duplica si ya existen).
# 3. Arranca la API.
set -e

echo "==> Aplicando migraciones de Prisma..."
npx prisma migrate deploy

echo "==> Sembrando catálogos base..."
# El seed es idempotente; si falla no debe tumbar el arranque.
npm run db:seed || echo "!! Seed omitido o ya aplicado."

echo "==> Iniciando ZenMind API..."
exec node dist/main
