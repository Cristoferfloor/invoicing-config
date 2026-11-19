import { createHash } from 'node:crypto';

import { ListarVersionesLogoUseCase } from '../src/application/use-cases/listar-versiones-logo.use-case';
import { ObtenerEmpresaUseCase } from '../src/application/use-cases/obtener-empresa.use-case';
import { ObtenerLogoUseCase } from '../src/application/use-cases/obtener-logo.use-case';
import { PublicarLogoUseCase } from '../src/application/use-cases/publicar-logo.use-case';
import { LogoInvalidoError, LogoNoEncontradoError } from '../src/domain/errors/configuracion.errors';
import { Logo, MAXIMO_BYTES_LOGO, NuevoLogo, tipoDeImagen } from '../src/domain/model/logo.model';
import { DatosEmpresa, Empresa } from '../src/domain/model/empresa.model';
import { EmpresasRepositoryPort } from '../src/domain/ports/empresas.repository.port';
import { LogosRepositoryPort } from '../src/domain/ports/logos.repository.port';

const RUC = '2390625475001';
const PNG = (relleno: number) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16, relleno)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(16, 7)]);

class EmpresasEnMemoria implements EmpresasRepositoryPort {
  async guardar(datos: DatosEmpresa) {
    const empresa: Empresa = { ...datos, activa: true, version: 1, creadoEn: new Date(), actualizadoEn: new Date() };
    return { empresa, estado: 'CREADA' as const };
  }

  async obtener(ruc: string): Promise<Empresa | null> {
    return ruc === RUC
      ? {
          ruc, razonSocial: 'ROOTS Y ROUTES S.A.S', nombreComercial: null, direccionMatriz: 'Santo Domingo',
          ambiente: 2, obligadoContabilidad: true, contribuyenteEspecial: null, agenteRetencion: null, regimen: null,
          activa: true, version: 1, creadoEn: new Date(), actualizadoEn: new Date(),
        }
      : null;
  }
}

class LogosEnMemoria implements LogosRepositoryPort {
  readonly filas: Logo[] = [];

  async publicar(nuevo: NuevoLogo, autor: string) {
    const logo: Logo = { ...nuevo, version: this.filas.length + 1, subidoPor: autor, subidoEn: new Date() };
    this.filas.push(logo);
    return logo;
  }

  async vigente() {
    return this.filas.at(-1) ?? null;
  }

  async vigenteEn(_: string, fecha: Date) {
    const anteriores = this.filas.filter((l) => l.subidoEn <= fecha);
    return anteriores.at(-1) ?? this.filas[0] ?? null;
  }

  async versiones() {
    return [...this.filas].reverse();
  }
}

function armar() {
  const logos = new LogosEnMemoria();
  const obtenerEmpresa = new ObtenerEmpresaUseCase(new EmpresasEnMemoria());
  return {
    logos,
    publicar: new PublicarLogoUseCase(obtenerEmpresa, logos),
    obtener: new ObtenerLogoUseCase(obtenerEmpresa, logos),
    listar: new ListarVersionesLogoUseCase(obtenerEmpresa, logos),
  };
}

const subida = (contenido: Buffer) => ({ empresaRuc: RUC, contenido, nombreArchivo: 'logo.png', nota: null });

describe('logo de la empresa', () => {
  it('reconoce PNG y JPG por el contenido, no por el nombre', () => {
    expect(tipoDeImagen(PNG(1))).toBe('image/png');
    expect(tipoDeImagen(JPG)).toBe('image/jpeg');
    expect(tipoDeImagen(Buffer.from('<html>no soy imagen</html>'))).toBeNull();
  });

  it('rechaza lo que no es imagen y lo que pesa de mas', async () => {
    const { publicar, logos } = armar();
    await expect(publicar.ejecutar(subida(Buffer.from('PK...')), 'prueba')).rejects.toBeInstanceOf(LogoInvalidoError);
    await expect(
      publicar.ejecutar(subida(Buffer.concat([PNG(1), Buffer.alloc(MAXIMO_BYTES_LOGO)])), 'prueba'),
    ).rejects.toBeInstanceOf(LogoInvalidoError);
    expect(logos.filas).toHaveLength(0);
  });

  it('crea version nueva solo si la imagen cambio', async () => {
    const { publicar, logos } = armar();

    const primera = await publicar.ejecutar(subida(PNG(1)), 'prueba');
    const repetida = await publicar.ejecutar(subida(PNG(1)), 'prueba');
    const cambiada = await publicar.ejecutar(subida(PNG(2)), 'prueba');

    expect([primera.estado, repetida.estado, cambiada.estado]).toEqual(['PUBLICADO', 'SIN_CAMBIOS', 'PUBLICADO']);
    expect(cambiada.logo.version).toBe(2);
    expect(primera.logo.huella).toBe(createHash('sha256').update(PNG(1)).digest('hex'));
    expect(primera.logo).not.toHaveProperty('contenido');
    expect(logos.filas).toHaveLength(2);
  });

  it('devuelve el logo que estaba vigente en la fecha de la factura', async () => {
    const { publicar, obtener, logos } = armar();
    await publicar.ejecutar(subida(PNG(1)), 'prueba');
    logos.filas[0].subidoEn = new Date('2026-01-01T00:00:00Z');
    await publicar.ejecutar(subida(PNG(2)), 'prueba');
    logos.filas[1].subidoEn = new Date('2026-09-01T00:00:00Z');

    expect((await obtener.ejecutar(RUC, new Date('2026-06-15T00:00:00Z'))).version).toBe(1);
    expect((await obtener.ejecutar(RUC, new Date('2026-09-17T00:00:00Z'))).version).toBe(2);
    expect((await obtener.ejecutar(RUC)).version).toBe(2);
    // Factura anterior al primer logo cargado: se usa el primero.
    expect((await obtener.ejecutar(RUC, new Date('2025-01-01T00:00:00Z'))).version).toBe(1);
  });

  it('avisa cuando la empresa no tiene logo', async () => {
    const { obtener } = armar();
    await expect(obtener.ejecutar(RUC)).rejects.toBeInstanceOf(LogoNoEncontradoError);
  });
});
