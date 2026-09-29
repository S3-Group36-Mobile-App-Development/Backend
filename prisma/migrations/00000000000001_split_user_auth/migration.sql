-- ===========================================================================
-- Separación de autenticación: usuarios + usuarios_auth
-- ---------------------------------------------------------------------------
-- Objetivo:
--   1. Crear el enum auth_provider (LOCAL, GOOGLE).
--   2. Crear la tabla usuarios_auth (métodos de autenticación por usuario).
--   3. Migrar las credenciales LOCAL existentes desde usuarios.password_hash.
--   4. Eliminar password_hash de usuarios una vez migrado.
-- No se pierde ningún dato existente.
-- ===========================================================================

-- 1. Enum de proveedores de autenticación.
CREATE TYPE "auth_provider" AS ENUM ('LOCAL', 'GOOGLE');

-- 2. Tabla de métodos de autenticación.
CREATE TABLE "usuarios_auth" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "provider" "auth_provider" NOT NULL,
    "provider_user_id" TEXT,
    "password_hash" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_auth_pkey" PRIMARY KEY ("id")
);

-- Índices únicos:
--  - (provider, provider_user_id): evita duplicar el mismo login externo.
--  - (usuario_id, provider): un usuario no repite proveedor.
CREATE UNIQUE INDEX "usuarios_auth_provider_provider_user_id_key"
    ON "usuarios_auth" ("provider", "provider_user_id");
CREATE UNIQUE INDEX "usuarios_auth_usuario_id_provider_key"
    ON "usuarios_auth" ("usuario_id", "provider");

-- Clave foránea con borrado en cascada: al eliminar el usuario se borran sus
-- métodos de autenticación.
ALTER TABLE "usuarios_auth"
    ADD CONSTRAINT "usuarios_auth_usuario_id_fkey"
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Migrar credenciales LOCAL existentes.
-- Cada usuario con password_hash no nulo obtiene un método LOCAL con ese hash.
-- provider_user_id queda NULL para LOCAL.
INSERT INTO "usuarios_auth" ("usuario_id", "provider", "provider_user_id", "password_hash")
SELECT "id", 'LOCAL'::"auth_provider", NULL, "password_hash"
FROM "usuarios"
WHERE "password_hash" IS NOT NULL;

-- 4. Eliminar password_hash de usuarios (ya migrado a usuarios_auth).
ALTER TABLE "usuarios" DROP COLUMN "password_hash";
