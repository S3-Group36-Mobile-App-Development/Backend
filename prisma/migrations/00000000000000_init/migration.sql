-- CreateEnum
CREATE TYPE "tipo_institucion" AS ENUM ('universidad', 'empresa', 'gobierno');

-- CreateEnum
CREATE TYPE "plataforma_app" AS ENUM ('android_kotlin', 'flutter');

-- CreateEnum
CREATE TYPE "tipo_evento_telemetria" AS ENUM ('vista_pantalla', 'crash', 'uso_funcionalidad');

-- CreateTable
CREATE TABLE "instituciones" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "tipo_institucion" NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instituciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" BIGSERIAL NOT NULL,
    "institucion_id" BIGINT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre_visible" TEXT NOT NULL,
    "foto_perfil_url" TEXT,
    "institucion_id" BIGINT,
    "departamento_id" BIGINT,
    "consentimiento_datos" BOOLEAN NOT NULL DEFAULT false,
    "idioma_preferido" TEXT NOT NULL DEFAULT 'es',
    "modo_daltonismo_activo" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rachas" (
    "usuario_id" BIGINT NOT NULL,
    "racha_actual_dias" INTEGER NOT NULL DEFAULT 0,
    "racha_mas_larga_dias" INTEGER NOT NULL DEFAULT 0,
    "fecha_ultimo_checkin" DATE,

    CONSTRAINT "rachas_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "estados_animo" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono_url" TEXT,
    "orden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "estados_animo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chequeos_animo" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "estado_animo_id" BIGINT NOT NULL,
    "comentario" TEXT,
    "registrado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chequeos_animo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_personales" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "relacion" TEXT,
    "es_contacto_panico" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contactos_personales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_panico" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "contacto_id" BIGINT,
    "activado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conectado_en" TIMESTAMPTZ(6),

    CONSTRAINT "eventos_panico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_respiracion" (
    "id" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracion_segundos" INTEGER NOT NULL,
    "patron" JSONB NOT NULL,
    "vibra" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ejercicios_respiracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respiracion_sesiones" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "ejercicio_id" BIGINT NOT NULL,
    "iniciada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada_en" TIMESTAMPTZ(6),

    CONSTRAINT "respiracion_sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_emergencia" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "pais" TEXT,
    "descripcion" TEXT,

    CONSTRAINT "lineas_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocolos" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT,
    "titulo" TEXT NOT NULL,
    "es_predefinido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "protocolos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos_protocolo" (
    "id" BIGSERIAL NOT NULL,
    "protocolo_id" BIGINT NOT NULL,
    "orden_paso" SMALLINT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "pasos_protocolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocolo_vistas" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "protocolo_id" BIGINT NOT NULL,
    "visto_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocolo_vistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" BIGSERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_vistas" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "flashcard_id" BIGINT NOT NULL,
    "visto_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_vistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "juegos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT,
    "descripcion" TEXT,

    CONSTRAINT "juegos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "juegos_sesiones" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "juego_id" BIGINT NOT NULL,
    "iniciada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada_en" TIMESTAMPTZ(6),

    CONSTRAINT "juegos_sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audios" (
    "id" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duracion_segundos" INTEGER,

    CONSTRAINT "audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_reproducciones" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "audio_id" BIGINT,
    "titulo_local" TEXT,
    "iniciada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracion_escuchada_segundos" INTEGER,

    CONSTRAINT "audio_reproducciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_telemetria_app" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT,
    "plataforma" "plataforma_app" NOT NULL,
    "tipo_evento" "tipo_evento_telemetria" NOT NULL,
    "nombre_pantalla" TEXT,
    "metadata" JSONB,
    "ocurrido_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_telemetria_app_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "instituciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rachas" ADD CONSTRAINT "rachas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chequeos_animo" ADD CONSTRAINT "chequeos_animo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chequeos_animo" ADD CONSTRAINT "chequeos_animo_estado_animo_id_fkey" FOREIGN KEY ("estado_animo_id") REFERENCES "estados_animo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_personales" ADD CONSTRAINT "contactos_personales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_panico" ADD CONSTRAINT "eventos_panico_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_panico" ADD CONSTRAINT "eventos_panico_contacto_id_fkey" FOREIGN KEY ("contacto_id") REFERENCES "contactos_personales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respiracion_sesiones" ADD CONSTRAINT "respiracion_sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respiracion_sesiones" ADD CONSTRAINT "respiracion_sesiones_ejercicio_id_fkey" FOREIGN KEY ("ejercicio_id") REFERENCES "ejercicios_respiracion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocolos" ADD CONSTRAINT "protocolos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasos_protocolo" ADD CONSTRAINT "pasos_protocolo_protocolo_id_fkey" FOREIGN KEY ("protocolo_id") REFERENCES "protocolos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocolo_vistas" ADD CONSTRAINT "protocolo_vistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocolo_vistas" ADD CONSTRAINT "protocolo_vistas_protocolo_id_fkey" FOREIGN KEY ("protocolo_id") REFERENCES "protocolos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_vistas" ADD CONSTRAINT "flashcard_vistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_vistas" ADD CONSTRAINT "flashcard_vistas_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juegos_sesiones" ADD CONSTRAINT "juegos_sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juegos_sesiones" ADD CONSTRAINT "juegos_sesiones_juego_id_fkey" FOREIGN KEY ("juego_id") REFERENCES "juegos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_reproducciones" ADD CONSTRAINT "audio_reproducciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_reproducciones" ADD CONSTRAINT "audio_reproducciones_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_telemetria_app" ADD CONSTRAINT "eventos_telemetria_app_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===========================================================================
-- Objetos especiales del diseño que Prisma no expresa directamente.
-- ===========================================================================

-- 2. Check-in diario: un único check-in por día y por usuario.
-- Nota: se fija la zona horaria a UTC para que la expresión sea IMMUTABLE
-- (requisito de PostgreSQL para índices por expresión). Así "un check-in por
-- día" se evalúa por día calendario UTC.
CREATE UNIQUE INDEX "idx_un_chequeo_por_dia"
    ON "chequeos_animo" ("usuario_id", (("registrado_en" AT TIME ZONE 'UTC')::date));

-- 3. Botón de Pánico: un único contacto de pánico por usuario.
CREATE UNIQUE INDEX "idx_un_contacto_panico"
    ON "contactos_personales" ("usuario_id")
    WHERE "es_contacto_panico" = true;

-- 3. eventos_panico: tiempo de respuesta calculado (columna generada).
ALTER TABLE "eventos_panico"
    ADD COLUMN "tiempo_respuesta_ms" INTEGER
    GENERATED ALWAYS AS (
        (EXTRACT(EPOCH FROM ("conectado_en" - "activado_en")) * 1000)::integer
    ) STORED;

-- 10. Tab Actividad: vista unificada de toda la actividad del usuario.
CREATE VIEW "vista_actividad_usuario" AS
SELECT "usuario_id", 'check_in'    AS tipo, "registrado_en" AS ocurrido_en, "comentario" AS detalle
FROM "chequeos_animo"
UNION ALL
SELECT "usuario_id", 'respiracion' AS tipo, "iniciada_en" AS ocurrido_en, NULL
FROM "respiracion_sesiones"
UNION ALL
SELECT "usuario_id", 'audio'       AS tipo, "iniciada_en" AS ocurrido_en, NULL
FROM "audio_reproducciones"
UNION ALL
SELECT "usuario_id", 'juego'       AS tipo, "iniciada_en" AS ocurrido_en, NULL
FROM "juegos_sesiones"
UNION ALL
SELECT "usuario_id", 'protocolo'   AS tipo, "visto_en" AS ocurrido_en, NULL
FROM "protocolo_vistas"
UNION ALL
SELECT "usuario_id", 'flashcard'   AS tipo, "visto_en" AS ocurrido_en, NULL
FROM "flashcard_vistas";

-- 11. Analítica institucional: resumen agregado por departamento y semana.
-- Solo expone grupos con al menos 5 usuarios distintos (k-anonimidad) y nunca
-- guarda IDs de usuario.
CREATE MATERIALIZED VIEW "resumen_actividad_departamento" AS
SELECT
    d."id"                                AS departamento_id,
    d."nombre"                            AS nombre_departamento,
    date_trunc('week', va.ocurrido_en)    AS semana,
    va.tipo,
    count(*)                              AS total_eventos
FROM "vista_actividad_usuario" va
JOIN "usuarios" u ON u."id" = va."usuario_id"
JOIN "departamentos" d ON d."id" = u."departamento_id"
WHERE u."consentimiento_datos" = true
GROUP BY d."id", d."nombre", semana, va.tipo
HAVING count(DISTINCT va."usuario_id") >= 5;
