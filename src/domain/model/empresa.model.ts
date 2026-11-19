// Datos de la empresa emisora. Sin secretos: el certificado vive en el
// firmador.
export interface DatosEmpresa {
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccionMatriz: string;
  // 1 pruebas, 2 produccion.
  ambiente: 1 | 2;
  obligadoContabilidad: boolean;
  contribuyenteEspecial: string | null;
  agenteRetencion: string | null;
  regimen: string | null;
}

export interface Empresa extends DatosEmpresa {
  activa: boolean;
  version: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

export type EstadoGuardadoEmpresa = 'CREADA' | 'ACTUALIZADA' | 'SIN_CAMBIOS';

const CAMPOS_EDITABLES: Array<keyof DatosEmpresa> = [
  'razonSocial', 'nombreComercial', 'direccionMatriz', 'ambiente', 'obligadoContabilidad',
  'contribuyenteEspecial', 'agenteRetencion', 'regimen',
];

export function empresaSinCambios(actual: Empresa, datos: DatosEmpresa): boolean {
  return CAMPOS_EDITABLES.every((campo) => actual[campo] === datos[campo]);
}
