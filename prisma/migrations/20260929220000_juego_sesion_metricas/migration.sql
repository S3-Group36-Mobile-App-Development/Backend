/*
  Rediseño de la entidad de sesión de juego (juegos_sesiones).

  Cambios:
  - id: BIGSERIAL -> UUID (generado por el cliente móvil).
  - Se elimina la relación con el catálogo de juegos (columna juego_id).
  - Se reemplaza el flujo iniciar/finalizar (iniciada_en / finalizada_en)
    por métricas de la partida completa: duration_ms, errors, correct_taps,
    completed_at (reportado por el cliente) y created_at (servidor).

  Las vistas vista_actividad_usuario y resumen_actividad_departamento
  dependen de juegos_sesiones, por lo que se recrean para usar completed_at.

  ATENCIÓN: se elimina y recrea la tabla; se pierden las sesiones existentes.
*/

-- 1. Eliminar las vistas que dependen de juegos_sesiones.
DROP MATERIALIZED VIEW IF EXISTS "resumen_actividad_departamento";
DROP VIEW IF EXISTS "vista_actividad_usuario";

-- 2. Recrear la tabla juegos_sesiones con el nuevo diseño.
DROP TABLE IF EXISTS "juegos_sesiones";

CREATE TABLE "juegos_sesiones" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL,
    "correct_taps" INTEGER NOT NULL,
    "completed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "juegos_sesiones_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "juegos_sesiones"
    ADD CONSTRAINT "juegos_sesiones_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "usuarios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Recrear la vista de actividad usando completed_at para los juegos.
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
SELECT "user_id"   AS usuario_id, 'juego' AS tipo, "completed_at" AS ocurrido_en, NULL
FROM "juegos_sesiones"
UNION ALL
SELECT "usuario_id", 'protocolo'   AS tipo, "visto_en" AS ocurrido_en, NULL
FROM "protocolo_vistas"
UNION ALL
SELECT "usuario_id", 'flashcard'   AS tipo, "visto_en" AS ocurrido_en, NULL
FROM "flashcard_vistas";

-- 4. Recrear la vista materializada de analítica institucional (k-anonimidad).
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
