import { Inject, Injectable } from '@nestjs/common';

import { ConexionErpConToken, contextoCifradoToken, enmascararToken } from '../../domain/model/conexion-erp.model';
import { ConexionErpNoEncontradaError } from '../../domain/errors/configuracion.errors';
import { CIFRADOR_PORT, CifradorPort } from '../../domain/ports/cifrador.port';
import { CONEXIONES_ERP_REPOSITORY, ConexionesErpRepositoryPort } from '../../domain/ports/conexiones-erp.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

// Para mostrar en la API: el token va enmascarado.
@Injectable()
export class ObtenerConexionErpUseCase {
  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(CONEXIONES_ERP_REPOSITORY) private readonly conexiones: ConexionesErpRepositoryPort,
    @Inject(CIFRADOR_PORT) private readonly cifrador: CifradorPort,
  ) {}

  async ejecutar(empresaRuc: string): Promise<ConexionErpConToken> {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    const guardada = await this.conexiones.obtener(empresaRuc);
    if (!guardada) throw new ConexionErpNoEncontradaError(`La empresa ${empresaRuc} no tiene conexion al ERP.`);

    const { tokenCifrado, ...conexion } = guardada;
    const token = this.cifrador.descifrar(tokenCifrado, contextoCifradoToken(empresaRuc)).toString('utf8');
    return { ...conexion, token: enmascararToken(token) };
  }
}
