import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { ResumenPlantilla, resumenDePlantilla } from '../../domain/model/plantilla.model';
import { PLANTILLAS_REPOSITORY, PlantillasRepositoryPort } from '../../domain/ports/plantillas.repository.port';
import { VALIDADOR_PLANTILLA_PORT, ValidadorPlantillaPort } from '../../domain/ports/validador-plantilla.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

export interface SubidaPlantilla {
  empresaRuc: string;
  tipoComprobante: string;
  contenido: string;
  nombreArchivo: string | null;
  nota: string | null;
}

@Injectable()
export class PublicarPlantillaUseCase {
  private readonly logger = new Logger(PublicarPlantillaUseCase.name);

  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(PLANTILLAS_REPOSITORY) private readonly plantillas: PlantillasRepositoryPort,
    @Inject(VALIDADOR_PLANTILLA_PORT) private readonly validador: ValidadorPlantillaPort,
  ) {}

  async ejecutar(
    subida: SubidaPlantilla,
    autor: string,
  ): Promise<{ plantilla: ResumenPlantilla; estado: 'PUBLICADA' | 'SIN_CAMBIOS' }> {
    await this.obtenerEmpresa.ejecutar(subida.empresaRuc);
    this.validador.validar(subida.contenido);

    const huella = createHash('sha256').update(subida.contenido, 'utf8').digest('hex');
    const vigente = await this.plantillas.vigente(subida.empresaRuc, subida.tipoComprobante);
    if (vigente && vigente.huella === huella) {
      return { plantilla: resumenDePlantilla(vigente), estado: 'SIN_CAMBIOS' };
    }

    const plantilla = await this.plantillas.publicar({ ...subida, huella }, autor);
    this.logger.log(JSON.stringify({
      evento: 'plantilla_publicada', empresaRuc: subida.empresaRuc, tipoComprobante: subida.tipoComprobante,
      version: plantilla.version, autor,
    }));
    return { plantilla: resumenDePlantilla(plantilla), estado: 'PUBLICADA' };
  }
}
