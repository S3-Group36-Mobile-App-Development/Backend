-- AlterTable: agrega la emoción inicial a las sesiones de respiración
ALTER TABLE "respiracion_sesiones" ADD COLUMN "initial_emotion" INTEGER;
