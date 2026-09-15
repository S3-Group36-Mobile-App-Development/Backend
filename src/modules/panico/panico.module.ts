import { Module } from '@nestjs/common';
import { PanicoService } from './panico.service';
import { PanicoController } from './panico.controller';

@Module({
  controllers: [PanicoController],
  providers: [PanicoService],
})
export class PanicoModule {}
