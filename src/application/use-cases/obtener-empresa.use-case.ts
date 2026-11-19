import { Inject, Injectable } from '@nestjs/common';

import { Empresa } from '../../domain/model/empresa.model';
import { EmpresaNoEncontradaError } from '../../domain/errors/configuracion.errors';
import { EMPRESAS_REPOSITORY, EmpresasRepositoryPort } from '../../domain/ports/empresas.repository.port';

@Injectable()
export class ObtenerEmpresaUseCase {
  constructor(@Inject(EMPRESAS_REPOSITORY) private readonly empresas: EmpresasRepositoryPort) {}

  async ejecutar(ruc: string): Promise<Empresa> {
    const empresa = await this.empresas.obtener(ruc);
    if (!empresa) {
      throw new EmpresaNoEncontradaError(`No existe la empresa ${ruc}. Primero registrela con PUT /v1/empresas/${ruc}.`);
    }
    return empresa;
  }
}
