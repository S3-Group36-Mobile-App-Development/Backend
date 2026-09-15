import { Module } from '@nestjs/common';
import { RespiraService } from './respira.service';
import { RespiraController } from './respira.controller';

@Module({
  controllers: [RespiraController],
  providers: [RespiraService],
})
export class RespiraModule {}
