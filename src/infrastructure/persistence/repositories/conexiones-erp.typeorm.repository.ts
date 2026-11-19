import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConexionErp, ConexionErpGuardada, DatosConexionErp } from '../../../domain/model/conexion-erp.model';
import { ConexionErpInvalidaError } from '../../../domain/errors/configuracion.errors';
import { ConexionesErpRepositoryPort } from '../../../domain/ports/conexiones-erp.repository.port';
import { ConexionErpEntity } from '../entities/conexion-erp.entity';
import { aConexionErp, aConexionErpGuardada } from '../mappers/conexion-erp.mapper';
import { registrarAuditoria } from './registrar-auditoria';

@Injectable()
export class ConexionesErpTypeOrmRepository implements ConexionesErpRepositoryPort {
  constructor(@InjectRepository(ConexionErpEntity) private readonly conexiones: Repository<ConexionErpEntity>) {}

  async guardar(
    datos: DatosConexionErp & { tokenCifrado: Buffer | null },
    autor: string,
    tokenVisible: string | null,
  ): Promise<{ conexion: ConexionErp; estado: 'CREADA' | 'ACTUALIZADA' }> {
    return this.conexiones.manager.transaction(async (manager) => {
      const fila = await manager.findOne(ConexionErpEntity, {
        where: { empresaRuc: datos.empresaRuc },
        lock: { mode: 'pessimistic_write' },
      });
      const antes = fila ? aConexionErp(fila) : null;

      const { empresaRuc, tokenCifrado, ...campos } = datos;
      if (antes) {
        await manager.update(ConexionErpEntity, { empresaRuc }, {
          ...campos,
          // Sin token nuevo se conserva el guardado.
          ...(tokenCifrado ? { tokenCifrado } : {}),
          version: () => 'version + 1',
          actualizadoEn: () => 'now()',
        });
      } else {
        if (!tokenCifrado) throw new ConexionErpInvalidaError('El token es obligatorio al crear la conexion.');
        await manager.insert(ConexionErpEntity, { empresaRuc, tokenCifrado, ...campos });
      }

      const conexion = aConexionErp(await manager.findOneByOrFail(ConexionErpEntity, { empresaRuc }));
      // En la auditoria nunca va el token: solo si se cambio.
      await registrarAuditoria(manager, {
        entidad: 'conexion_erp',
        entidadId: empresaRuc,
        accion: antes ? 'ACTUALIZAR' : 'CREAR',
        antes,
        despues: { ...conexion, token: tokenVisible === null ? '(sin cambios)' : `(cambiado) ${tokenVisible}` },
        autor,
      });
      return { conexion, estado: antes ? ('ACTUALIZADA' as const) : ('CREADA' as const) };
    });
  }

  async obtener(empresaRuc: string): Promise<ConexionErpGuardada | null> {
    const fila = await this.conexiones.findOneBy({ empresaRuc });
    return fila ? aConexionErpGuardada(fila) : null;
  }

  async listar(soloActivas: boolean): Promise<ConexionErpGuardada[]> {
    const filas = await this.conexiones.find({
      where: soloActivas ? { activa: true } : {},
      order: { empresaRuc: 'ASC' },
    });
    return filas.map(aConexionErpGuardada);
  }
}
