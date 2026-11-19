import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NuevaPlantilla, Plantilla, ResumenPlantilla, resumenDePlantilla } from '../../../domain/model/plantilla.model';
import { PlantillasRepositoryPort } from '../../../domain/ports/plantillas.repository.port';
import { EmpresaEntity } from '../entities/empresa.entity';
import { PlantillaEntity } from '../entities/plantilla.entity';
import { aPlantilla, aResumenPlantilla } from '../mappers/plantilla.mapper';
import { registrarAuditoria } from './registrar-auditoria';

@Injectable()
export class PlantillasTypeOrmRepository implements PlantillasRepositoryPort {
  constructor(@InjectRepository(PlantillaEntity) private readonly plantillas: Repository<PlantillaEntity>) {}

  async publicar(nueva: NuevaPlantilla, autor: string): Promise<Plantilla> {
    return this.plantillas.manager.transaction(async (manager) => {
      // Bloquea la empresa para que dos subidas a la vez no tomen el mismo
      // numero de version.
      await manager.findOne(EmpresaEntity, {
        where: { ruc: nueva.empresaRuc },
        lock: { mode: 'pessimistic_write' },
      });
      const ultima = await manager.maximum(PlantillaEntity, 'version', {
        empresaRuc: nueva.empresaRuc,
        tipoComprobante: nueva.tipoComprobante,
      });

      const { identifiers } = await manager.insert(PlantillaEntity, {
        ...nueva,
        version: (ultima ?? 0) + 1,
        subidoPor: autor,
      });
      const plantilla = aPlantilla(await manager.findOneByOrFail(PlantillaEntity, { id: identifiers[0].id }));

      await registrarAuditoria(manager, {
        entidad: 'plantilla',
        entidadId: `${nueva.empresaRuc}/${nueva.tipoComprobante}`,
        accion: 'PUBLICAR',
        antes: null,
        despues: resumenDePlantilla(plantilla),
        autor,
      });
      return plantilla;
    });
  }

  async vigente(empresaRuc: string, tipoComprobante: string): Promise<Plantilla | null> {
    const fila = await this.plantillas.findOne({
      where: { empresaRuc, tipoComprobante },
      order: { version: 'DESC' },
    });
    return fila ? aPlantilla(fila) : null;
  }

  async versiones(empresaRuc: string, tipoComprobante: string): Promise<ResumenPlantilla[]> {
    // Sin el contenido: solo el historial.
    const filas = await this.plantillas.find({
      select: {
        id: true, empresaRuc: true, tipoComprobante: true, version: true, huella: true,
        nombreArchivo: true, nota: true, subidoPor: true, subidoEn: true,
      },
      where: { empresaRuc, tipoComprobante },
      order: { version: 'DESC' },
    });
    return filas.map(aResumenPlantilla);
  }
}
