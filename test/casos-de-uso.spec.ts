import { randomBytes } from 'node:crypto';

import { GuardarConexionErpUseCase } from '../src/application/use-cases/guardar-conexion-erp.use-case';
import { ListarConexionesErpUseCase } from '../src/application/use-cases/listar-conexiones-erp.use-case';
import { ObtenerConexionErpUseCase } from '../src/application/use-cases/obtener-conexion-erp.use-case';
import { ObtenerEmpresaUseCase } from '../src/application/use-cases/obtener-empresa.use-case';
import { PublicarPlantillaUseCase } from '../src/application/use-cases/publicar-plantilla.use-case';
import {
  ConexionErpInvalidaError,
  EmpresaNoEncontradaError,
  PlantillaInvalidaError,
} from '../src/domain/errors/configuracion.errors';
import { ConexionErpGuardada, DatosConexionErp, enmascararToken, normalizarUrlErp } from '../src/domain/model/conexion-erp.model';
import { DatosEmpresa, Empresa } from '../src/domain/model/empresa.model';
import { NuevaPlantilla, Plantilla } from '../src/domain/model/plantilla.model';
import { ConexionesErpRepositoryPort } from '../src/domain/ports/conexiones-erp.repository.port';
import { EmpresasRepositoryPort } from '../src/domain/ports/empresas.repository.port';
import { PlantillasRepositoryPort } from '../src/domain/ports/plantillas.repository.port';
import { AesGcmCifradorAdapter } from '../src/infrastructure/crypto/aes-gcm-cifrador.adapter';
import { XmldomValidadorPlantillaAdapter } from '../src/infrastructure/xml/xmldom-validador-plantilla.adapter';

const RUC = '2390625475001';
const PLANTILLA = '<tags><prop name="factura" type="padre"/></tags>';

class EmpresasEnMemoria implements EmpresasRepositoryPort {
  readonly filas = new Map<string, Empresa>();

  async guardar(datos: DatosEmpresa) {
    const empresa: Empresa = { ...datos, activa: true, version: 1, creadoEn: new Date(), actualizadoEn: new Date() };
    this.filas.set(datos.ruc, empresa);
    return { empresa, estado: 'CREADA' as const };
  }

  async obtener(ruc: string) {
    return this.filas.get(ruc) ?? null;
  }
}

class PlantillasEnMemoria implements PlantillasRepositoryPort {
  readonly filas: Plantilla[] = [];

  async publicar(nueva: NuevaPlantilla, autor: string) {
    const version = this.filas.filter((p) => p.tipoComprobante === nueva.tipoComprobante).length + 1;
    const plantilla: Plantilla = { ...nueva, version, subidoPor: autor, subidoEn: new Date() };
    this.filas.push(plantilla);
    return plantilla;
  }

  async vigente(_: string, tipo: string) {
    return this.filas.filter((p) => p.tipoComprobante === tipo).at(-1) ?? null;
  }

  async versiones(_: string, tipo: string) {
    return this.filas.filter((p) => p.tipoComprobante === tipo).reverse();
  }
}

class ConexionesEnMemoria implements ConexionesErpRepositoryPort {
  readonly filas = new Map<string, ConexionErpGuardada>();

  async guardar(datos: DatosConexionErp & { tokenCifrado: Buffer | null }) {
    const antes = this.filas.get(datos.empresaRuc);
    const conexion: ConexionErpGuardada = {
      ...datos,
      tokenCifrado: datos.tokenCifrado ?? antes!.tokenCifrado,
      version: (antes?.version ?? 0) + 1,
      actualizadoEn: new Date(),
    };
    this.filas.set(datos.empresaRuc, conexion);
    return { conexion, estado: antes ? ('ACTUALIZADA' as const) : ('CREADA' as const) };
  }

  async obtener(ruc: string) {
    return this.filas.get(ruc) ?? null;
  }

  async listar(soloActivas: boolean) {
    return [...this.filas.values()].filter((c) => !soloActivas || c.activa);
  }
}

function armar() {
  const empresas = new EmpresasEnMemoria();
  const plantillas = new PlantillasEnMemoria();
  const conexiones = new ConexionesEnMemoria();
  const cifrador = new AesGcmCifradorAdapter(randomBytes(32).toString('base64'));
  const obtenerEmpresa = new ObtenerEmpresaUseCase(empresas);
  const obtenerConexion = new ObtenerConexionErpUseCase(obtenerEmpresa, conexiones, cifrador);

  return {
    empresas,
    plantillas,
    publicar: new PublicarPlantillaUseCase(obtenerEmpresa, plantillas, new XmldomValidadorPlantillaAdapter()),
    guardarConexion: new GuardarConexionErpUseCase(obtenerEmpresa, obtenerConexion, conexiones, cifrador),
    listarConexiones: new ListarConexionesErpUseCase(conexiones, cifrador),
  };
}

async function conEmpresa() {
  const casos = armar();
  await casos.empresas.guardar({
    ruc: RUC, razonSocial: 'ROOTS Y ROUTES S.A.S', nombreComercial: null, direccionMatriz: 'Santo Domingo',
    ambiente: 1, obligadoContabilidad: true, contribuyenteEspecial: null, agenteRetencion: null, regimen: null,
  });
  return casos;
}

const subida = (contenido: string) => ({
  empresaRuc: RUC, tipoComprobante: '01', contenido, nombreArchivo: 'factura.xml', nota: null,
});

describe('publicar plantilla', () => {
  it('pide que la empresa exista', async () => {
    const { publicar } = armar();
    await expect(publicar.ejecutar(subida(PLANTILLA), 'prueba')).rejects.toBeInstanceOf(EmpresaNoEncontradaError);
  });

  it('no guarda una plantilla invalida', async () => {
    const { publicar, plantillas } = await conEmpresa();
    await expect(publicar.ejecutar(subida('<factura/>'), 'prueba')).rejects.toBeInstanceOf(PlantillaInvalidaError);
    expect(plantillas.filas).toHaveLength(0);
  });

  it('crea version nueva solo si el contenido cambio', async () => {
    const { publicar, plantillas } = await conEmpresa();

    const primera = await publicar.ejecutar(subida(PLANTILLA), 'prueba');
    const repetida = await publicar.ejecutar(subida(PLANTILLA), 'prueba');
    const cambiada = await publicar.ejecutar(subida(PLANTILLA.replace('padre', 'fix')), 'prueba');

    expect([primera.estado, repetida.estado, cambiada.estado]).toEqual(['PUBLICADA', 'SIN_CAMBIOS', 'PUBLICADA']);
    expect(cambiada.plantilla.version).toBe(2);
    expect(plantillas.filas).toHaveLength(2);
    expect(primera.plantilla).not.toHaveProperty('contenido');
  });
});

describe('conexion al ERP', () => {
  const entrada = { url: 'http://erp.local/ws/rootrouters', activa: true, intervaloSegundos: 20 };

  it('pide el token al crear', async () => {
    const { guardarConexion } = await conEmpresa();
    await expect(guardarConexion.ejecutar(RUC, entrada, 'prueba')).rejects.toBeInstanceOf(ConexionErpInvalidaError);
  });

  it('guarda el token cifrado, lo muestra enmascarado y lo conserva si no llega', async () => {
    const { guardarConexion, listarConexiones } = await conEmpresa();

    const creada = await guardarConexion.ejecutar(RUC, { ...entrada, token: 'ogLcachBBr1zfzNnTV75' }, 'prueba');
    expect(creada.estado).toBe('CREADA');
    expect(creada.conexion.token).toBe('og***75');
    expect(creada.conexion.url).toBe('http://erp.local/ws/rootrouters/');

    const actualizada = await guardarConexion.ejecutar(RUC, { ...entrada, activa: false }, 'prueba');
    expect(actualizada.estado).toBe('ACTUALIZADA');

    // El Conector ERP recibe el token completo.
    const [conexion] = await listarConexiones.ejecutar(false);
    expect(conexion.token).toBe('ogLcachBBr1zfzNnTV75');
    expect(await listarConexiones.ejecutar(true)).toHaveLength(0);
  });

  it('nunca muestra el token completo y la URL termina en /', () => {
    expect(enmascararToken('ogLcachBBr1zfzNnTV75')).toBe('og***75');
    expect(enmascararToken('corto')).toBe('***');
    expect(normalizarUrlErp('http://erp/ws')).toBe('http://erp/ws/');
    expect(normalizarUrlErp('http://erp/ws/')).toBe('http://erp/ws/');
  });
});
