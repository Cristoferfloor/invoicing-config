import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { GuardarConexionErpUseCase } from '../../../application/use-cases/guardar-conexion-erp.use-case';
import { ListarConexionesErpUseCase } from '../../../application/use-cases/listar-conexiones-erp.use-case';
import { ObtenerConexionErpUseCase } from '../../../application/use-cases/obtener-conexion-erp.use-case';
import { Autor } from '../decorators/autor.decorator';
import { GuardarConexionErpDto } from '../dto/guardar-conexion-erp.dto';
import { TokenAdminGuard } from '../guards/token-admin.guard';
import { RucPipe } from '../pipes/ruc.pipe';

// Conexion al web service del ERP de cada empresa. El token se guarda
// cifrado y en esta API solo se muestra enmascarado.
@ApiTags('Conexiones ERP')
@ApiSecurity('token-admin')
@Controller('v1')
@UseGuards(TokenAdminGuard)
export class ConexionesErpController {
  constructor(
    private readonly guardarConexion: GuardarConexionErpUseCase,
    private readonly obtenerConexion: ObtenerConexionErpUseCase,
    private readonly listarConexiones: ListarConexionesErpUseCase,
  ) {}

  @Put('empresas/:ruc/erp')
  @ApiOperation({ summary: 'Crea o actualiza la conexion al ERP de la empresa' })
  @ApiHeader({ name: 'X-Autor', required: false, description: 'Quien hace el cambio (auditoria)' })
  async guardar(@Param('ruc', RucPipe) ruc: string, @Body() cuerpo: GuardarConexionErpDto, @Autor() autor: string) {
    return this.guardarConexion.ejecutar(ruc, cuerpo, autor);
  }

  @Get('empresas/:ruc/erp')
  @ApiOperation({ summary: 'Conexion al ERP de la empresa (token enmascarado)' })
  async obtener(@Param('ruc', RucPipe) ruc: string) {
    return this.obtenerConexion.ejecutar(ruc);
  }

  // Uso interno del Conector ERP: devuelve el token descifrado.
  @Get('conexiones-erp')
  @ApiOperation({ summary: 'Conexiones para el Conector ERP (token descifrado)' })
  @ApiQuery({ name: 'activas', required: false, enum: ['true', 'false'], description: 'Por defecto true' })
  async listar(@Query('activas') activas?: string) {
    return this.listarConexiones.ejecutar(activas !== 'false');
  }
}
