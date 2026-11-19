import { Inject, Injectable } from '@nestjs/common';

import { ResumenLogo } from '../../domain/model/logo.model';
import { LOGOS_REPOSITORY, LogosRepositoryPort } from '../../domain/ports/logos.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

@Injectable()
export class ListarVersionesLogoUseCase {
  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(LOGOS_REPOSITORY) private readonly logos: LogosRepositoryPort,
  ) {}

  async ejecutar(empresaRuc: string): Promise<ResumenLogo[]> {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    return this.logos.versiones(empresaRuc);
  }
}
