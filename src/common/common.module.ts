import { Global, Module } from '@nestjs/common';
import { ConsentimientoService } from './services/consentimiento.service';

@Global()
@Module({
  providers: [ConsentimientoService],
  exports: [ConsentimientoService],
})
export class CommonModule {}
