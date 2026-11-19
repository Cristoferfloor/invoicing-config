import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatosEmpresa, Empresa, EstadoGuardadoEmpresa, empresaSinCambios } from '../../../domain/model/empresa.model';
import { EmpresasRepositoryPort } from '../../../domain/ports/empresas.repository.port';
import { EmpresaEntity } from '../entities/empresa.entity';
import { aEmpresa } from '../mappers/empresa.mapper';
import { registrarAuditoria } from './registrar-auditoria';

@Injectable()
export class EmpresasTypeOrmRepository implements EmpresasRepositoryPort {
  constructor(@InjectRepository(EmpresaEntity) private readonly empresas: Repository<EmpresaEntity>) {}

  async guardar(datos: DatosEmpresa, autor: string): Promise<{ empresa: Empresa; estado: EstadoGuardadoEmpresa }> {
    return this.empresas.manager.transaction(async (manager) => {
      const fila = await manager.findOne(EmpresaEntity, {
        where: { ruc: datos.ruc },
        lock: { mode: 'pessimistic_write' },
      });
      const antes = fila ? aEmpresa(fila) : null;

      if (antes && empresaSinCambios(antes, datos)) {
        return { empresa: antes, estado: 'SIN_CAMBIOS' as const };
      }

      const { ruc, ...campos } = datos;
      if (antes) {
        await manager.update(EmpresaEntity, { ruc }, {
          ...campos,
          version: () => 'version + 1',
          actualizadoEn: () => 'now()',
        });
      } else {
        await manager.insert(EmpresaEntity, datos);
      }

      const empresa = aEmpresa(await manager.findOneByOrFail(EmpresaEntity, { ruc }));
      await registrarAuditoria(manager, {
        entidad: 'empresa',
        entidadId: ruc,
        accion: antes ? 'ACTUALIZAR' : 'CREAR',
        antes,
        despues: empresa,
        autor,
      });
      return { empresa, estado: antes ? ('ACTUALIZADA' as const) : ('CREADA' as const) };
    });
  }

  async obtener(ruc: string): Promise<Empresa | null> {
    const fila = await this.empresas.findOneBy({ ruc });
    return fila ? aEmpresa(fila) : null;
  }
}
