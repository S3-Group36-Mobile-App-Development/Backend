import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Flashcards')
@Controller({ path: 'flashcards', version: '1' })
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Catálogo de flashcards.' })
  @ApiQuery({ name: 'categoria', required: false })
  listar(@Query('categoria') categoria?: string) {
    return this.flashcardsService.listar(categoria);
  }

  @Public()
  @Get('categorias')
  @ApiOperation({ summary: 'Categorías de flashcards disponibles.' })
  listarCategorias() {
    return this.flashcardsService.listarCategorias();
  }

  @ApiBearerAuth()
  @Post(':id/vistas')
  @ApiOperation({ summary: 'Registrar que el usuario vio una flashcard.' })
  registrarVista(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.flashcardsService.registrarVista(usuarioId, BigInt(id));
  }
}
