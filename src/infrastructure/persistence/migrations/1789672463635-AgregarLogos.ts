import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarLogos1789672463635 implements MigrationInterface {
    name = 'AgregarLogos1789672463635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logos" ("id" BIGSERIAL NOT NULL, "empresa_ruc" character(13) NOT NULL, "version" integer NOT NULL, "contenido" bytea NOT NULL, "tipo_mime" text NOT NULL, "huella_sha256" character(64) NOT NULL, "bytes" integer NOT NULL, "nombre_archivo" text, "nota" text, "subido_por" text NOT NULL, "subido_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "logos_empresa_ruc_version_key" UNIQUE ("empresa_ruc", "version"), CONSTRAINT "logos_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "logos" ADD CONSTRAINT "logos_empresa_ruc_fkey" FOREIGN KEY ("empresa_ruc") REFERENCES "empresas"("ruc") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logos" DROP CONSTRAINT "logos_empresa_ruc_fkey"`);
        await queryRunner.query(`DROP TABLE "logos"`);
    }

}
