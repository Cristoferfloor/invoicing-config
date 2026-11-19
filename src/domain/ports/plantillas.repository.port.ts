import { NuevaPlantilla, Plantilla, ResumenPlantilla } from '../model/plantilla.model';

export const PLANTILLAS_REPOSITORY = Symbol('PLANTILLAS_REPOSITORY');

export interface PlantillasRepositoryPort {
  // Guarda como version siguiente, con su registro de auditoria.
  publicar(nueva: NuevaPlantilla, autor: string): Promise<Plantilla>;
  vigente(empresaRuc: string, tipoComprobante: string): Promise<Plantilla | null>;
  versiones(empresaRuc: string, tipoComprobante: string): Promise<ResumenPlantilla[]>;
}
