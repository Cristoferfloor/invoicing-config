import { Inject, Injectable } from '@nestjs/common';

import { ResumenPlantilla } from '../../domain/model/plantilla.model';
import { PLANTILLAS_REPOSITORY, PlantillasRepositoryPort } from '../../domain/ports/plantillas.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

@Injectable()
export class ListarVersionesPlantillaUseCase {
  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(PLANTILLAS_REPOSITORY) private readonly plantillas: PlantillasRepositoryPort,
  ) {}

  async ejecutar(empresaRuc: string, tipoComprobante: string): Promise<ResumenPlantilla[]> {
    await this.obtenerEmpresa.ejecutar(empresaRuc);
    return this.plantillas.versiones(empresaRuc, tipoComprobante);
  }
}
