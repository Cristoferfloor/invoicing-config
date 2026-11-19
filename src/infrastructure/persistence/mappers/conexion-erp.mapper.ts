import { ConexionErp, ConexionErpGuardada } from '../../../domain/model/conexion-erp.model';
import { ConexionErpEntity } from '../entities/conexion-erp.entity';

export function aConexionErp(fila: ConexionErpEntity): ConexionErp {
  return {
    empresaRuc: fila.empresaRuc,
    url: fila.url,
    activa: fila.activa,
    intervaloSegundos: fila.intervaloSegundos,
    version: fila.version,
    actualizadoEn: fila.actualizadoEn,
  };
}

export function aConexionErpGuardada(fila: ConexionErpEntity): ConexionErpGuardada {
  return { ...aConexionErp(fila), tokenCifrado: fila.tokenCifrado };
}
