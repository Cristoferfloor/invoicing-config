import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { GuardarEmpresaUseCase } from '../../../application/use-cases/guardar-empresa.use-case';
import { ObtenerEmpresaUseCase } from '../../../application/use-cases/obtener-empresa.use-case';
import { Autor } from '../decorators/autor.decorator';
import { GuardarEmpresaDto } from '../dto/guardar-empresa.dto';
import { TokenAdminGuard } from '../guards/token-admin.guard';
import { RucPipe } from '../pipes/ruc.pipe';

@ApiTags('Empresas')
@ApiSecurity('token-admin')
@Controller('v1/empresas')
@UseGuards(TokenAdminGuard)
export class EmpresasController {
  constructor(
    private readonly guardarEmpresa: GuardarEmpresaUseCase,
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
  ) {}

  @Put(':ruc')
  @ApiOperation({ summary: 'Crea o actualiza los datos de la empresa emisora' })
  @ApiHeader({ name: 'X-Autor', required: false, description: 'Quien hace el cambio (auditoria)' })
  async guardar(@Param('ruc', RucPipe) ruc: string, @Body() cuerpo: GuardarEmpresaDto, @Autor() autor: string) {
    return this.guardarEmpresa.ejecutar(
      {
        ruc,
        razonSocial: cuerpo.razonSocial,
        nombreComercial: cuerpo.nombreComercial ?? null,
        direccionMatriz: cuerpo.direccionMatriz,
        ambiente: cuerpo.ambiente,
        obligadoContabilidad: cuerpo.obligadoContabilidad,
        contribuyenteEspecial: cuerpo.contribuyenteEspecial ?? null,
        agenteRetencion: cuerpo.agenteRetencion ?? null,
        regimen: cuerpo.regimen ?? null,
      },
      autor,
    );
  }

  @Get(':ruc')
  @ApiOperation({ summary: 'Datos de la empresa' })
  async obtener(@Param('ruc', RucPipe) ruc: string) {
    return this.obtenerEmpresa.ejecutar(ruc);
  }
}
