import { DatosEmpresa, Empresa, EstadoGuardadoEmpresa } from '../model/empresa.model';

export const EMPRESAS_REPOSITORY = Symbol('EMPRESAS_REPOSITORY');

export interface EmpresasRepositoryPort {
  // Crea o actualiza, y deja el registro de auditoria en la misma transaccion.
  guardar(datos: DatosEmpresa, autor: string): Promise<{ empresa: Empresa; estado: EstadoGuardadoEmpresa }>;
  obtener(ruc: string): Promise<Empresa | null>;
}
