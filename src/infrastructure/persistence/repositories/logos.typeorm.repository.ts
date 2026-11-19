import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import { Logo, NuevoLogo, ResumenLogo, resumenDeLogo } from '../../../domain/model/logo.model';
import { LogosRepositoryPort } from '../../../domain/ports/logos.repository.port';
import { EmpresaEntity } from '../entities/empresa.entity';
import { LogoEntity } from '../entities/logo.entity';
import { aLogo, aResumenLogo } from '../mappers/logo.mapper';
import { registrarAuditoria } from './registrar-auditoria';

@Injectable()
export class LogosTypeOrmRepository implements LogosRepositoryPort {
  constructor(@InjectRepository(LogoEntity) private readonly logos: Repository<LogoEntity>) {}

  async publicar(nuevo: NuevoLogo, autor: string): Promise<Logo> {
    return this.logos.manager.transaction(async (manager) => {
      // Bloquea la empresa para que dos subidas a la vez no tomen el mismo
      // numero de version.
      await manager.findOne(EmpresaEntity, {
        where: { ruc: nuevo.empresaRuc },
        lock: { mode: 'pessimistic_write' },
      });
      const ultima = await manager.maximum(LogoEntity, 'version', { empresaRuc: nuevo.empresaRuc });

      const { identifiers } = await manager.insert(LogoEntity, {
        ...nuevo,
        version: (ultima ?? 0) + 1,
        subidoPor: autor,
      });
      const logo = aLogo(await manager.findOneByOrFail(LogoEntity, { id: identifiers[0].id }));

      // En la auditoria va la ficha del logo, no la imagen.
      await registrarAuditoria(manager, {
        entidad: 'logo',
        entidadId: nuevo.empresaRuc,
        accion: 'PUBLICAR',
        antes: null,
        despues: resumenDeLogo(logo),
        autor,
      });
      return logo;
    });
  }

  async vigente(empresaRuc: string): Promise<Logo | null> {
    const fila = await this.logos.findOne({ where: { empresaRuc }, order: { version: 'DESC' } });
    return fila ? aLogo(fila) : null;
  }

  async vigenteEn(empresaRuc: string, fecha: Date): Promise<Logo | null> {
    const fila = await this.logos.findOne({
      where: { empresaRuc, subidoEn: LessThanOrEqual(fecha) },
      order: { version: 'DESC' },
    });
    if (fila) return aLogo(fila);

    // Todos los logos son posteriores a esa fecha (por ejemplo, la empresa
    // cargo el logo despues de facturar): se usa el primero.
    const primero = await this.logos.findOne({ where: { empresaRuc }, order: { version: 'ASC' } });
    return primero ? aLogo(primero) : null;
  }

  async versiones(empresaRuc: string): Promise<ResumenLogo[]> {
    // Sin la imagen: solo el historial.
    const filas = await this.logos.find({
      select: {
        id: true, empresaRuc: true, version: true, huella: true, tipo: true, bytes: true,
        nombreArchivo: true, nota: true, subidoPor: true, subidoEn: true,
      },
      where: { empresaRuc },
      order: { version: 'DESC' },
    });
    return filas.map(aResumenLogo);
  }
}
