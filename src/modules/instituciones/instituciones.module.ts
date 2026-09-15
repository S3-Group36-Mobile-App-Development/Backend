import { Module } from '@nestjs/common';
import { InstitucionesService } from './instituciones.service';
import { InstitucionesController } from './instituciones.controller';

@Module({
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
})
export class InstitucionesModule {}
