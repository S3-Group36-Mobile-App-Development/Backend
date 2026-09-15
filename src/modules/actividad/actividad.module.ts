import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { ActividadController } from './actividad.controller';

@Module({
  controllers: [ActividadController],
  providers: [ActividadService],
})
export class ActividadModule {}
