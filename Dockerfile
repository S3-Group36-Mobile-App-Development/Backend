# ---- Etapa de build ----
# Usamos Debian slim (no Alpine): Prisma detecta OpenSSL de forma fiable aquí.
# En Alpine, Prisma falla al cargar el schema engine por problemas con libssl.
FROM node:20-slim AS builder

WORKDIR /app

# openssl es necesario para que Prisma genere/ejecute sus engines nativos.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Etapa de runtime ----
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Instala TODAS las dependencias: el arranque necesita el CLI de Prisma
# (migrate deploy) y ts-node (para ejecutar el seed).
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --include=dev
COPY tsconfig.json ./

# Genera el cliente Prisma en esta etapa (incluye el engine de
# debian-openssl-3.0.x declarado en schema.prisma).
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Script de arranque: aplica migraciones, siembra catálogos y lanza la API.
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Render inyecta $PORT (por defecto 10000); la app también acepta PORT.
EXPOSE 10000
CMD ["./docker-entrypoint.sh"]
