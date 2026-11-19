import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Quien cambio que y cuando. Solo se agregan filas: nunca se edita ni se borra.
@Entity({ name: 'auditoria' })
@Index('auditoria_por_entidad', ['entidad', 'entidadId', 'fecha'])
export class AuditoriaEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', primaryKeyConstraintName: 'auditoria_pkey' })
  id!: string;

  @Column({ type: 'text' })
  entidad!: string;

  @Column({ name: 'entidad_id', type: 'text' })
  entidadId!: string;

  @Column({ type: 'text' })
  accion!: string;

  @Column({ type: 'jsonb', nullable: true })
  antes!: object | null;

  @Column({ type: 'jsonb', nullable: true })
  despues!: object | null;

  @Column({ type: 'text' })
  autor!: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha!: Date;
}
