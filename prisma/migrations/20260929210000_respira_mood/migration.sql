-- AlterTable: agrega mood final y pausas de movimiento a las sesiones de respiración
ALTER TABLE "respiracion_sesiones" ADD COLUMN "final_emotion" INTEGER;
ALTER TABLE "respiracion_sesiones" ADD COLUMN "number_movement_pauses" INTEGER;
