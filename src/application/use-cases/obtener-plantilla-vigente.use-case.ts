import { Inject, Injectable } from '@nestjs/common';

import { Plantilla } from '../../domain/model/plantilla.model';
import { PlantillaNoEncontradaError } from '../../domain/errors/configuracion.errors';
import { PLANTILLAS_REPOSITORY, PlantillasRepositoryPort } from '../../domain/ports/plantillas.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

@Injectable()
export class ObtenerPlantillaVigenteUseCase {
  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(PLANTILLAS_REPOSITORY) private readonly plantillas: PlantillasRepositoryPort,
  ) {}

  async ejecutar(empresaRuc: string, tipoComprobante: string): Promise<Plantilla> {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    const plantilla = await this.plantillas.vigente(empresaRuc, tipoComprobante);
    if (!plantilla) {
      throw new PlantillaNoEncontradaError(`La empresa ${empresaRuc} no tiene plantilla para el tipo ${tipoComprobante}.`);
    }
    return plantilla;
  }
}
