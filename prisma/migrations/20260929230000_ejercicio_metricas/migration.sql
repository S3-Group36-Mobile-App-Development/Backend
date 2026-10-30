-- Métricas agregadas en ejercicios_respiracion.
-- usage_count: nº de veces que el ejercicio fue completado.
-- rating_avg:  calificación promedio (0 si no tiene calificaciones).
-- rating_count: nº de calificaciones recibidas.
-- Son columnas nuevas con DEFAULT, así que no afectan las filas existentes.

ALTER TABLE "ejercicios_respiracion"
    ADD COLUMN "usage_count" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;
