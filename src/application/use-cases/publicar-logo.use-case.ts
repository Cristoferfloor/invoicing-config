import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { MAXIMO_BYTES_LOGO, ResumenLogo, resumenDeLogo, tipoDeImagen } from '../../domain/model/logo.model';
import { LogoInvalidoError } from '../../domain/errors/configuracion.errors';
import { LOGOS_REPOSITORY, LogosRepositoryPort } from '../../domain/ports/logos.repository.port';
import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';

export interface SubidaLogo {
  empresaRuc: string;
  contenido: Buffer;
  nombreArchivo: string | null;
  nota: string | null;
}

@Injectable()
export class PublicarLogoUseCase {
  private readonly logger = new Logger(PublicarLogoUseCase.name);

  constructor(
    private readonly obtenerEmpresa: ObtenerEmpresaUseCase,
    @Inject(LOGOS_REPOSITORY) private readonly logos: LogosRepositoryPort,
  ) {}

  async ejecutar(subida: SubidaLogo, autor: string): Promise<{ logo: ResumenLogo; estado: 'PUBLICADO' | 'SIN_CAMBIOS' }> {
    await this.obtenerEmpresa.ejecutar(subida.empresaRuc);

    const tipo = tipoDeImagen(subida.contenido);
    if (!tipo) throw new LogoInvalidoError('El logo debe ser una imagen PNG o JPG.');
    if (subida.contenido.length > MAXIMO_BYTES_LOGO) {
      throw new LogoInvalidoError(`El logo no puede pesar mas de ${MAXIMO_BYTES_LOGO / 1024} KB.`);
    }

    const huella = createHash('sha256').update(subida.contenido).digest('hex');
    const vigente = await this.logos.vigente(subida.empresaRuc);
    if (vigente && vigente.huella === huella) {
      return { logo: resumenDeLogo(vigente), estado: 'SIN_CAMBIOS' };
    }

    const logo = await this.logos.publicar(
      { ...subida, huella, tipo, bytes: subida.contenido.length },
      autor,
    );
    this.logger.log(JSON.stringify({
      evento: 'logo_publicado', empresaRuc: subida.empresaRuc, version: logo.version, bytes: logo.bytes, autor,
    }));
    return { logo: resumenDeLogo(logo), estado: 'PUBLICADO' };
  }
}
