import { Plantilla, ResumenPlantilla } from '../../../domain/model/plantilla.model';
import { PlantillaEntity } from '../entities/plantilla.entity';

export function aResumenPlantilla(fila: PlantillaEntity): ResumenPlantilla {
  return {
    empresaRuc: fila.empresaRuc,
    tipoComprobante: fila.tipoComprobante,
    version: fila.version,
    huella: fila.huella,
    nombreArchivo: fila.nombreArchivo,
    nota: fila.nota,
    subidoPor: fila.subidoPor,
    subidoEn: fila.subidoEn,
  };
}

export function aPlantilla(fila: PlantillaEntity): Plantilla {
  return { ...aResumenPlantilla(fila), contenido: fila.contenido };
}
