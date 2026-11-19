import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { EmpresaEntity } from './empresa.entity';

// Una conexion por empresa: la clave primaria es el RUC.
@Entity({ name: 'conexiones_erp' })
@Check('conexiones_erp_intervalo_segundos_check', 'intervalo_segundos >= 15 AND intervalo_segundos <= 3600')
export class ConexionErpEntity {
  @PrimaryColumn({ name: 'empresa_ruc', type: 'char', length: 13, primaryKeyConstraintName: 'conexiones_erp_pkey' })
  empresaRuc!: string;

  @ManyToOne(() => EmpresaEntity, { nullable: false })
  @JoinColumn({ name: 'empresa_ruc', referencedColumnName: 'ruc', foreignKeyConstraintName: 'conexiones_erp_empresa_ruc_fkey' })
  empresa?: EmpresaEntity;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'token_cifrado', type: 'bytea' })
  tokenCifrado!: Buffer;

  @Column({ type: 'boolean' })
  activa!: boolean;

  @Column({ name: 'intervalo_segundos', type: 'integer' })
  intervaloSegundos!: number;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'actualizado_en', type: 'timestamptz', default: () => 'now()' })
  actualizadoEn!: Date;
}
