export const VALIDADOR_PLANTILLA_PORT = Symbol('VALIDADOR_PLANTILLA_PORT');

export interface ValidadorPlantillaPort {
  // Lanza PlantillaInvalidaError si el Generador XML no podria leerla.
  validar(contenido: string): void;
}
