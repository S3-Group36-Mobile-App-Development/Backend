# ---- Etapa de build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Etapa de runtime ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Instala TODAS las dependencias: el arranque necesita el CLI de Prisma
# (migrate deploy) y ts-node (para ejecutar el seed).
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Genera el cliente Prisma en esta etapa (evita depender de artefactos
# de la etapa de build que puedan quedar desalineados).
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Script de arranque: aplica migraciones, siembra catálogos y lanza la API.
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Render inyecta $PORT (por defecto 10000); la app también acepta PORT.
EXPOSE 10000
CMD ["./docker-entrypoint.sh"]
