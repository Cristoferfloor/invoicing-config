import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiProduces, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ListarVersionesLogoUseCase } from '../../../application/use-cases/listar-versiones-logo.use-case';
import { ObtenerLogoUseCase } from '../../../application/use-cases/obtener-logo.use-case';
import { PublicarLogoUseCase } from '../../../application/use-cases/publicar-logo.use-case';
import { MAXIMO_BYTES_LOGO } from '../../../domain/model/logo.model';
import { Autor } from '../decorators/autor.decorator';
import { ObtenerLogoQueryDto } from '../dto/obtener-logo.query.dto';
import { SubirLogoDto } from '../dto/subir-logo.dto';
import { TokenAdminGuard } from '../guards/token-admin.guard';
import { RucPipe } from '../pipes/ruc.pipe';

// Logo de la empresa para el RIDE. Cada cambio es una version nueva.
@ApiTags('Logos')
@ApiSecurity('token-admin')
@Controller('v1/empresas/:ruc/logo')
@UseGuards(TokenAdminGuard)
export class LogosController {
  constructor(
    private readonly publicarLogo: PublicarLogoUseCase,
    private readonly obtenerLogo: ObtenerLogoUseCase,
    private readonly listarVersiones: ListarVersionesLogoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sube el logo de la empresa (nueva version si cambio)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['archivo'],
      properties: {
        archivo: { type: 'string', format: 'binary', description: 'PNG o JPG, maximo 512 KB' },
        nota: { type: 'string', maxLength: 500 },
      },
    },
  })
  @ApiHeader({ name: 'X-Autor', required: false, description: 'Quien hace el cambio (auditoria)' })
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAXIMO_BYTES_LOGO, files: 1 } }))
  async publicar(
    @Param('ruc', RucPipe) ruc: string,
    @Body() cuerpo: SubirLogoDto,
    @UploadedFile() archivo: Express.Multer.File | undefined,
    @Autor() autor: string,
  ) {
    if (!archivo) throw new BadRequestException('Falta la imagen del logo (campo "archivo").');

    return this.publicarLogo.ejecutar(
      {
        empresaRuc: ruc,
        contenido: archivo.buffer,
        nombreArchivo: archivo.originalname ?? null,
        nota: cuerpo.nota ?? null,
      },
      autor,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Imagen del logo vigente, o el vigente en una fecha' })
  @ApiProduces('image/png', 'image/jpeg')
  async imagen(
    @Param('ruc', RucPipe) ruc: string,
    @Query() consulta: ObtenerLogoQueryDto,
    @Res() respuesta: Response,
  ): Promise<void> {
    const logo = await this.obtenerLogo.ejecutar(ruc, consulta.vigenteEn ? new Date(consulta.vigenteEn) : undefined);
    respuesta
      .setHeader('Content-Type', logo.tipo)
      .setHeader('X-Logo-Version', String(logo.version))
      .setHeader('X-Logo-Huella', logo.huella)
      .send(logo.contenido);
  }

  @Get('versiones')
  @ApiOperation({ summary: 'Historial de logos, sin las imagenes' })
  async versiones(@Param('ruc', RucPipe) ruc: string) {
    return { empresaRuc: ruc, versiones: await this.listarVersiones.ejecutar(ruc) };
  }
}
