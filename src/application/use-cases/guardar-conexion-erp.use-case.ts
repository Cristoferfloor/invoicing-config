import { Inject, Injectable, Logger } from '@nestjs/common';

import { contextoCifradoToken, enmascararToken, normalizarUrlErp } from '../../domain/model/conexion-erp.model';
import { ConexionErpInvalidaError } from '../../domain/errors/configuracion.errors';
import { CIFRADOR_PORT, CifradorPort } from '../../domain/ports/cifrador.port';
import { CONEXIONES_ERP_REPOSITORY, ConexionesErpRepositoryPort } from '../../domain/ports/conexiones-erp.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';
import { ObtenerConexionErpUseCase } from './obtener-conexion-erp.use-case';

export interface EntradaConexionErp {
  url: string;
  // Obligatorio al crear. Al actualizar, si no viene se conserva el guardado.
  token?: string;
  activa: boolean;
  intervaloSegundos: number;
}

@Injectable()
export class GuardarConexionErpUseCase {
  private readonly logger = new Logger(GuardarConexionErpUseCase.name);

  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    private readonly obtenerConexion: ObtenerConexionErpUseCase,
    @Inject(CONEXIONES_ERP_REPOSITORY) private readonly conexiones: ConexionesErpRepositoryPort,
    @Inject(CIFRADOR_PORT) private readonly cifrador: CifradorPort,
  ) {}

  async ejecutar(empresaRuc: string, entrada: EntradaConexionErp, autor: string) {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    const existente = await this.conexiones.obtener(empresaRuc);
    if (!existente && !entrada.token) {
      throw new ConexionErpInvalidaError('El token es obligatorio al crear la conexion.');
    }

    const token = entrada.token ?? null;
    const { conexion, estado } = await this.conexiones.guardar(
      {
        empresaRuc,
        url: normalizarUrlErp(entrada.url),
        activa: entrada.activa,
        intervaloSegundos: entrada.intervaloSegundos,
        tokenCifrado: token ? this.cifrador.cifrar(Buffer.from(token, 'utf8'), contextoCifradoToken(empresaRuc)) : null,
      },
      autor,
      token ? enmascararToken(token) : null,
    );
    this.logger.log(JSON.stringify({ evento: 'conexion_erp_guardada', empresaRuc, estado, activa: conexion.activa, autor }));
    return { estado, conexion: await this.obtenerConexion.ejecutar(empresaRuc) };
  }
}
