import { XmldomValidadorPlantillaAdapter } from '../src/infrastructure/xml/xmldom-validador-plantilla.adapter';
import { RUC, esTipoValido } from '../src/domain/reglas';

describe('validacion de plantillas', () => {
  const validador = new XmldomValidadorPlantillaAdapter();

  it('acepta una plantilla con <tags> y props completos', () => {
    expect(() =>
      validador.validar('<tags><prop name="factura" type="padre"><prop name="ruc" type="string" model="db" var="ruc"/></prop></tags>'),
    ).not.toThrow();
  });

  it('rechaza XML mal formado', () => {
    expect(() => validador.validar('<tags><prop name="factura" type="padre"></tags>')).toThrow(/XML valido/);
  });

  it('rechaza una raiz distinta de <tags>', () => {
    expect(() => validador.validar('<factura><prop name="a" type="fix"/></factura>')).toThrow(/<tags>/);
  });

  it('rechaza un <prop> sin type', () => {
    expect(() => validador.validar('<tags><prop name="factura"/></tags>')).toThrow(/name o type/);
  });

  it('rechaza una plantilla vacia', () => {
    expect(() => validador.validar('   ')).toThrow(/vacia/);
  });
});

describe('reglas', () => {
  it('valida RUC y tipo de comprobante', () => {
    expect(RUC.test('2390625475001')).toBe(true);
    expect(RUC.test('239062547500')).toBe(false);
    expect(esTipoValido('01')).toBe(true);
    expect(esTipoValido('99')).toBe(false);
  });
});
