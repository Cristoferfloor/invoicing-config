import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { TipoImagenLogo } from '../../../domain/model/logo.model';
import { EmpresaEntity } from './empresa.entity';

@Entity({ name: 'logos' })
@Unique('logos_empresa_ruc_version_key', ['empresaRuc', 'version'])
export class LogoEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', primaryKeyConstraintName: 'logos_pkey' })
  id!: string;

  @Column({ name: 'empresa_ruc', type: 'char', length: 13 })
  empresaRuc!: string;

  @ManyToOne(() => EmpresaEntity, { nullable: false })
  @JoinColumn({ name: 'empresa_ruc', referencedColumnName: 'ruc', foreignKeyConstraintName: 'logos_empresa_ruc_fkey' })
  empresa?: EmpresaEntity;

  @Column({ type: 'integer' })
  version!: number;

  @Column({ type: 'bytea' })
  contenido!: Buffer;

  @Column({ name: 'tipo_mime', type: 'text' })
  tipo!: TipoImagenLogo;

  @Column({ name: 'huella_sha256', type: 'char', length: 64 })
  huella!: string;

  @Column({ type: 'integer' })
  bytes!: number;

  @Column({ name: 'nombre_archivo', type: 'text', nullable: true })
  nombreArchivo!: string | null;

  @Column({ type: 'text', nullable: true })
  nota!: string | null;

  @Column({ name: 'subido_por', type: 'text' })
  subidoPor!: string;

  @Column({ name: 'subido_en', type: 'timestamptz', default: () => 'now()' })
  subidoEn!: Date;
}
