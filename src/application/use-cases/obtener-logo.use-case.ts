import { Inject, Injectable } from '@nestjs/common';

import { Logo } from '../../domain/model/logo.model';
import { LogoNoEncontradoError } from '../../domain/errors/configuracion.errors';
import { LOGOS_REPOSITORY, LogosRepositoryPort } from '../../domain/ports/logos.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

@Injectable()
export class ObtenerLogoUseCase {
  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(LOGOS_REPOSITORY) private readonly logos: LogosRepositoryPort,
  ) {}

  // Con fecha, el logo que estaba vigente ese dia: el RIDE de una factura
  // vieja sale como salio entonces.
  async ejecutar(empresaRuc: string, vigenteEn?: Date): Promise<Logo> {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    const logo = vigenteEn
      ? await this.logos.vigenteEn(empresaRuc, vigenteEn)
      : await this.logos.vigente(empresaRuc);
    if (!logo) throw new LogoNoEncontradoError(`La empresa ${empresaRuc} no tiene logo cargado.`);
    return logo;
  }
}
