import { EntityManager } from 'typeorm';

import { AuditoriaEntity } from '../entities/auditoria.entity';

export interface RegistroAuditoria {
  entidad: 'empresa' | 'plantilla' | 'logo' | 'conexion_erp';
  entidadId: string;
  accion: 'CREAR' | 'ACTUALIZAR' | 'PUBLICAR';
  antes: object | null;
  despues: object | null;
  autor: string;
}

// Se llama con el manager de la transaccion del cambio: si el cambio no se
// guarda, tampoco queda su auditoria.
export async function registrarAuditoria(manager: EntityManager, registro: RegistroAuditoria): Promise<void> {
  await manager.insert(AuditoriaEntity, registro);
}
