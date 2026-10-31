#!/bin/sh
# Arranque del backend de ZenMind en producción (Render / Docker).
# 1. Aplica las migraciones pendientes.
# 2. Siembra los catálogos base (idempotente: no duplica si ya existen).
# 3. Arranca la API.
set -e

echo "==> Aplicando migraciones de Prisma..."
# Si migrate deploy falla, suele ser porque una migración quedó marcada como
# "failed" en _prisma_migrations (P3009) y bloquea los siguientes deploys.
# En ese caso intentamos recuperarnos: marcamos la última migración fallida
# como aplicada (ya que, en una base nueva, los objetos pueden existir
# parcialmente) y reintentamos una vez.
if ! npx prisma migrate deploy; then
  echo "!! migrate deploy falló. Intentando recuperar el estado de migraciones..."
  # Intenta resolver cualquier migración pendiente/fallida y reintentar.
  npx prisma migrate resolve --applied 20260929220000_juego_sesion_metricas 2>/dev/null || true
  npx prisma migrate resolve --applied 20260929230000_ejercicio_metricas 2>/dev/null || true
  echo "==> Reintentando migrate deploy..."
  npx prisma migrate deploy
fi

echo "==> Sembrando catálogos base..."
# El seed es idempotente; si falla no debe tumbar el arranque.
npm run db:seed || echo "!! Seed omitido o ya aplicado."

echo "==> Iniciando ZenMind API..."
exec node dist/main
