// Como leer los comprobantes pendientes del ERP de una empresa (web service
// del ERP actual: <url>facturas/input/{"token":...}).
export interface DatosConexionErp {
  empresaRuc: string;
  url: string;
  activa: boolean;
  intervaloSegundos: number;
}

export interface ConexionErp extends DatosConexionErp {
  version: number;
  actualizadoEn: Date;
}

// Como se guarda: el token cifrado.
export interface ConexionErpGuardada extends ConexionErp {
  tokenCifrado: Buffer;
}

// Lo que se muestra en la API: el token enmascarado.
// Para el Conector ERP: el token descifrado.
export interface ConexionErpConToken extends ConexionErp {
  token: string;
}

export const contextoCifradoToken = (empresaRuc: string) => `conexion-erp:${empresaRuc}:token`;

export function enmascararToken(token: string): string {
  return token.length <= 6 ? '***' : `${token.slice(0, 2)}***${token.slice(-2)}`;
}

// El web service se arma como <url>facturas/input/...: la URL termina en "/".
export function normalizarUrlErp(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
