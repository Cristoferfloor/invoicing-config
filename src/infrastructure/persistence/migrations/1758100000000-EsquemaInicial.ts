import { MigrationInterface, QueryRunner } from 'typeorm';

// Esquema inicial de Configuracion. Usa IF NOT EXISTS porque las tablas ya
// existian antes de pasar a migraciones: en esa base no cambia nada y solo
// queda registrada como aplicada; en una base nueva crea todo.
//
// Los cambios siguientes NO se escriben a mano: se cambia la entidad y se
// genera la migracion con `npm run migration:generate`.
export class EsquemaInicial1758100000000 implements MigrationInterface {
  name = 'EsquemaInicial1758100000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        ruc                     character(13) NOT NULL,
        razon_social            text NOT NULL,
        nombre_comercial        text,
        direccion_matriz        text NOT NULL,
        ambiente                smallint NOT NULL,
        obligado_contabilidad   boolean NOT NULL,
        contribuyente_especial  text,
        agente_retencion        text,
        regimen                 text,
        activa                  boolean NOT NULL DEFAULT true,
        version                 integer NOT NULL DEFAULT 1,
        creado_en               timestamp with time zone NOT NULL DEFAULT now(),
        actualizado_en          timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT empresas_pkey PRIMARY KEY (ruc),
        CONSTRAINT empresas_ambiente_check CHECK (ambiente = ANY (ARRAY[1, 2]))
      )`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS plantillas (
        id                bigserial NOT NULL,
        empresa_ruc       character(13) NOT NULL,
        tipo_comprobante  text NOT NULL,
        version           integer NOT NULL,
        contenido         text NOT NULL,
        huella_sha256     character(64) NOT NULL,
        nombre_archivo    text,
        nota              text,
        subido_por        text NOT NULL,
        subido_en         timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT plantillas_pkey PRIMARY KEY (id),
        CONSTRAINT plantillas_empresa_ruc_tipo_comprobante_version_key UNIQUE (empresa_ruc, tipo_comprobante, version),
        CONSTRAINT plantillas_empresa_ruc_fkey FOREIGN KEY (empresa_ruc) REFERENCES empresas (ruc)
      )`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id          bigserial NOT NULL,
        entidad     text NOT NULL,
        entidad_id  text NOT NULL,
        accion      text NOT NULL,
        antes       jsonb,
        despues     jsonb,
        autor       text NOT NULL,
        fecha       timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT auditoria_pkey PRIMARY KEY (id)
      )`);
    await q.query('CREATE INDEX IF NOT EXISTS auditoria_por_entidad ON auditoria (entidad, entidad_id, fecha DESC)');

    await q.query(`
      CREATE TABLE IF NOT EXISTS conexiones_erp (
        empresa_ruc         character(13) NOT NULL,
        url                 text NOT NULL,
        token_cifrado       bytea NOT NULL,
        activa              boolean NOT NULL,
        intervalo_segundos  integer NOT NULL,
        version             integer NOT NULL DEFAULT 1,
        actualizado_en      timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT conexiones_erp_pkey PRIMARY KEY (empresa_ruc),
        CONSTRAINT conexiones_erp_intervalo_segundos_check CHECK (intervalo_segundos >= 15 AND intervalo_segundos <= 3600),
        CONSTRAINT conexiones_erp_empresa_ruc_fkey FOREIGN KEY (empresa_ruc) REFERENCES empresas (ruc)
      )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS conexiones_erp');
    await q.query('DROP TABLE IF EXISTS auditoria');
    await q.query('DROP TABLE IF EXISTS plantillas');
    await q.query('DROP TABLE IF EXISTS empresas');
  }
}
