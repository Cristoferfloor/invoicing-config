// Logo de la empresa para el RIDE. Nunca se sobrescribe: cada cambio es una
// version nueva, para que el RIDE de una factura vieja salga con el logo que
// la empresa tenia en esa fecha.
export type TipoImagenLogo = 'image/png' | 'image/jpeg';

export interface ResumenLogo {
  empresaRuc: string;
  version: number;
  huella: string;
  tipo: TipoImagenLogo;
  bytes: number;
  nombreArchivo: string | null;
  nota: string | null;
  subidoPor: string;
  subidoEn: Date;
}

export interface Logo extends ResumenLogo {
  contenido: Buffer;
}

export interface NuevoLogo {
  empresaRuc: string;
  contenido: Buffer;
  huella: string;
  tipo: TipoImagenLogo;
  bytes: number;
  nombreArchivo: string | null;
  nota: string | null;
}

export const MAXIMO_BYTES_LOGO = 512 * 1024;

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff]);

// Por el contenido, no por el nombre del archivo: un .png puede traer
// cualquier cosa adentro.
export function tipoDeImagen(contenido: Buffer): TipoImagenLogo | null {
  if (contenido.subarray(0, PNG.length).equals(PNG)) return 'image/png';
  if (contenido.subarray(0, JPEG.length).equals(JPEG)) return 'image/jpeg';
  return null;
}

export function resumenDeLogo(logo: Logo): ResumenLogo {
  const { contenido: _contenido, ...resumen } = logo;
  return resumen;
}
