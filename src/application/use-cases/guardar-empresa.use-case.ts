import { Inject, Injectable, Logger } from '@nestjs/common';

import { DatosEmpresa } from '../../domain/model/empresa.model';
import { EMPRESAS_REPOSITORY, EmpresasRepositoryPort } from '../../domain/ports/empresas.repository.port';

@Injectable()
export class GuardarEmpresaUseCase {
  private readonly logger = new Logger(GuardarEmpresaUseCase.name);

  constructor(@Inject(EMPRESAS_REPOSITORY) private readonly empresas: EmpresasRepositoryPort) {}

  async ejecutar(datos: DatosEmpresa, autor: string) {
    const resultado = await this.empresas.guardar(datos, autor);
    this.logger.log(JSON.stringify({
      evento: 'empresa_guardada', empresaRuc: datos.ruc, estado: resultado.estado, version: resultado.empresa.version, autor,
    }));
    return resultado;
  }
}
