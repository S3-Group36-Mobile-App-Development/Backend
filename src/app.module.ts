import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { PanicoModule } from './modules/panico/panico.module';
import { RespiraModule } from './modules/respira/respira.module';
import { ApoyoModule } from './modules/apoyo/apoyo.module';
import { ProtocolosModule } from './modules/protocolos/protocolos.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { JuegosModule } from './modules/juegos/juegos.module';
import { AudiosModule } from './modules/audios/audios.module';
import { ActividadModule } from './modules/actividad/actividad.module';
import { TelemetriaModule } from './modules/telemetria/telemetria.module';
import { InstitucionesModule } from './modules/instituciones/instituciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsuariosModule,
    CheckinModule,
    PanicoModule,
    RespiraModule,
    ApoyoModule,
    ProtocolosModule,
    FlashcardsModule,
    JuegosModule,
    AudiosModule,
    ActividadModule,
    TelemetriaModule,
    InstitucionesModule,
  ],
})
export class AppModule {}
