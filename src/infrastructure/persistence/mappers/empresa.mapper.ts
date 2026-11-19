import { Empresa } from '../../../domain/model/empresa.model';
import { EmpresaEntity } from '../entities/empresa.entity';

export function aEmpresa(fila: EmpresaEntity): Empresa {
  return {
    ruc: fila.ruc,
    razonSocial: fila.razonSocial,
    nombreComercial: fila.nombreComercial,
    direccionMatriz: fila.direccionMatriz,
    ambiente: fila.ambiente,
    obligadoContabilidad: fila.obligadoContabilidad,
    contribuyenteEspecial: fila.contribuyenteEspecial,
    agenteRetencion: fila.agenteRetencion,
    regimen: fila.regimen,
    activa: fila.activa,
    version: fila.version,
    creadoEn: fila.creadoEn,
    actualizadoEn: fila.actualizadoEn,
  };
}
