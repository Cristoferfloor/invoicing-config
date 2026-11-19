import { ConexionErp, ConexionErpGuardada, DatosConexionErp } from '../model/conexion-erp.model';

export const CONEXIONES_ERP_REPOSITORY = Symbol('CONEXIONES_ERP_REPOSITORY');

export interface ConexionesErpRepositoryPort {
  // tokenCifrado null: se conserva el token guardado. tokenVisible va a la
  // auditoria; nunca el token completo.
  guardar(
    datos: DatosConexionErp & { tokenCifrado: Buffer | null },
    autor: string,
    tokenVisible: string | null,
  ): Promise<{ conexion: ConexionErp; estado: 'CREADA' | 'ACTUALIZADA' }>;
  obtener(empresaRuc: string): Promise<ConexionErpGuardada | null>;
  listar(soloActivas: boolean): Promise<ConexionErpGuardada[]>;
}
