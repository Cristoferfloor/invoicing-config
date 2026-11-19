import { Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'empresas' })
@Check('empresas_ambiente_check', 'ambiente = ANY (ARRAY[1, 2])')
export class EmpresaEntity {
  @PrimaryColumn({ type: 'char', length: 13, primaryKeyConstraintName: 'empresas_pkey' })
  ruc!: string;

  @Column({ name: 'razon_social', type: 'text' })
  razonSocial!: string;

  @Column({ name: 'nombre_comercial', type: 'text', nullable: true })
  nombreComercial!: string | null;

  @Column({ name: 'direccion_matriz', type: 'text' })
  direccionMatriz!: string;

  @Column({ type: 'smallint' })
  ambiente!: 1 | 2;

  @Column({ name: 'obligado_contabilidad', type: 'boolean' })
  obligadoContabilidad!: boolean;

  @Column({ name: 'contribuyente_especial', type: 'text', nullable: true })
  contribuyenteEspecial!: string | null;

  @Column({ name: 'agente_retencion', type: 'text', nullable: true })
  agenteRetencion!: string | null;

  @Column({ type: 'text', nullable: true })
  regimen!: string | null;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'creado_en', type: 'timestamptz', default: () => 'now()' })
  creadoEn!: Date;

  @Column({ name: 'actualizado_en', type: 'timestamptz', default: () => 'now()' })
  actualizadoEn!: Date;
}
