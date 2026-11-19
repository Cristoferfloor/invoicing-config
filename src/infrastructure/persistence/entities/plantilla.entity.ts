import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { EmpresaEntity } from './empresa.entity';

@Entity({ name: 'plantillas' })
@Unique('plantillas_empresa_ruc_tipo_comprobante_version_key', ['empresaRuc', 'tipoComprobante', 'version'])
export class PlantillaEntity {
  // bigint llega como texto desde pg.
  @PrimaryGeneratedColumn('increment', { type: 'bigint', primaryKeyConstraintName: 'plantillas_pkey' })
  id!: string;

  @Column({ name: 'empresa_ruc', type: 'char', length: 13 })
  empresaRuc!: string;

  @ManyToOne(() => EmpresaEntity, { nullable: false })
  @JoinColumn({ name: 'empresa_ruc', referencedColumnName: 'ruc', foreignKeyConstraintName: 'plantillas_empresa_ruc_fkey' })
  empresa?: EmpresaEntity;

  @Column({ name: 'tipo_comprobante', type: 'text' })
  tipoComprobante!: string;

  @Column({ type: 'integer' })
  version!: number;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ name: 'huella_sha256', type: 'char', length: 64 })
  huella!: string;

  @Column({ name: 'nombre_archivo', type: 'text', nullable: true })
  nombreArchivo!: string | null;

  @Column({ type: 'text', nullable: true })
  nota!: string | null;

  @Column({ name: 'subido_por', type: 'text' })
  subidoPor!: string;

  @Column({ name: 'subido_en', type: 'timestamptz', default: () => 'now()' })
  subidoEn!: Date;
}
