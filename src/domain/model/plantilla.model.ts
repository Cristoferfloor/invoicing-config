// Plantilla XML de una empresa para un tipo de comprobante, en el lenguaje
// del sistema actual (<tags><prop .../></tags>). Nunca se sobrescribe: cada
// cambio es una version nueva.
export interface ResumenPlantilla {
  empresaRuc: string;
  tipoComprobante: string;
  version: number;
  huella: string;
  nombreArchivo: string | null;
  nota: string | null;
  subidoPor: string;
  subidoEn: Date;
}

export interface Plantilla extends ResumenPlantilla {
  contenido: string;
}

export interface NuevaPlantilla {
  empresaRuc: string;
  tipoComprobante: string;
  contenido: string;
  huella: string;
  nombreArchivo: string | null;
  nota: string | null;
}

export function resumenDePlantilla(plantilla: Plantilla): ResumenPlantilla {
  const { contenido: _contenido, ...resumen } = plantilla;
  return resumen;
}
