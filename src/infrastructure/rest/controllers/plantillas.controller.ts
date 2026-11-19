import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ListarVersionesPlantillaUseCase } from '../../../application/use-cases/listar-versiones-plantilla.use-case';
import { ObtenerPlantillaVigenteUseCase } from '../../../application/use-cases/obtener-plantilla-vigente.use-case';
import { PublicarPlantillaUseCase } from '../../../application/use-cases/publicar-plantilla.use-case';
import { TIPOS_COMPROBANTE } from '../../../domain/reglas';
import { Autor } from '../decorators/autor.decorator';
import { SubirPlantillaDto } from '../dto/subir-plantilla.dto';
import { TokenAdminGuard } from '../guards/token-admin.guard';
import { RucPipe } from '../pipes/ruc.pipe';
import { TipoComprobantePipe } from '../pipes/tipo-comprobante.pipe';

const BOM = /^﻿/;

@ApiTags('Plantillas')
@ApiSecurity('token-admin')
@ApiParam({ name: 'tipo', enum: TIPOS_COMPROBANTE })
@Controller('v1/empresas/:ruc/plantillas/:tipo')
@UseGuards(TokenAdminGuard)
export class PlantillasController {
  constructor(
    private readonly publicarPlantilla: PublicarPlantillaUseCase,
    private readonly obtenerVigente: ObtenerPlantillaVigenteUseCase,
    private readonly listarVersiones: ListarVersionesPlantillaUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publica una version nueva de la plantilla (si cambio)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['archivo'],
      properties: {
        archivo: { type: 'string', format: 'binary', description: 'Plantilla .xml, maximo 1 MB' },
        nota: { type: 'string', maxLength: 500 },
      },
    },
  })
  @ApiHeader({ name: 'X-Autor', required: false, description: 'Quien hace el cambio (auditoria)' })
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: 1024 * 1024, files: 1 } }))
  async publicar(
    @Param('ruc', RucPipe) ruc: string,
    @Param('tipo', TipoComprobantePipe) tipo: string,
    @Body() cuerpo: SubirPlantillaDto,
    @UploadedFile() archivo: Express.Multer.File | undefined,
    @Autor() autor: string,
  ) {
    if (!archivo) throw new BadRequestException('Falta el archivo de la plantilla (campo "archivo").');

    return this.publicarPlantilla.ejecutar(
      {
        empresaRuc: ruc,
        tipoComprobante: tipo,
        contenido: archivo.buffer.toString('utf8').replace(BOM, ''),
        nombreArchivo: archivo.originalname ?? null,
        nota: cuerpo.nota ?? null,
      },
      autor,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Plantilla vigente, con su contenido' })
  async vigente(@Param('ruc', RucPipe) ruc: string, @Param('tipo', TipoComprobantePipe) tipo: string) {
    return this.obtenerVigente.ejecutar(ruc, tipo);
  }

  @Get('versiones')
  @ApiOperation({ summary: 'Historial de versiones, sin contenido' })
  async versiones(@Param('ruc', RucPipe) ruc: string, @Param('tipo', TipoComprobantePipe) tipo: string) {
    return { empresaRuc: ruc, tipoComprobante: tipo, versiones: await this.listarVersiones.ejecutar(ruc, tipo) };
  }
}
