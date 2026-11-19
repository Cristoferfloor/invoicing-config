import { Inject, Injectable } from '@nestjs/common';

import { ConexionErpConToken, contextoCifradoToken } from '../../domain/model/conexion-erp.model';
import { CIFRADOR_PORT, CifradorPort } from '../../domain/ports/cifrador.port';
import { CONEXIONES_ERP_REPOSITORY, ConexionesErpRepositoryPort } from '../../domain/ports/conexiones-erp.repository.port';

// Uso interno del Conector ERP: devuelve el token descifrado.
@Injectable()
export class ListarConexionesErpUseCase {
  constructor(
    @Inject(CONEXIONES_ERP_REPOSITORY) private readonly conexiones: ConexionesErpRepositoryPort,
    @Inject(CIFRADOR_PORT) private readonly cifrador: CifradorPort,
  ) {}

  async ejecutar(soloActivas: boolean): Promise<ConexionErpConToken[]> {
    const guardadas = await this.conexiones.listar(soloActivas);
    return guardadas.map(({ tokenCifrado, ...conexion }) => ({
      ...conexion,
      token: this.cifrador.descifrar(tokenCifrado, contextoCifradoToken(conexion.empresaRuc)).toString('utf8'),
    }));
  }
}
