import { DOMParser } from '@xmldom/xmldom';

import { ValidadorPlantillaPort } from '../../domain/ports/validador-plantilla.port';
import { PlantillaInvalidaError } from '../../domain/errors/configuracion.errors';

// Revisa lo minimo para no guardar algo que el Generador XML no puede leer:
// XML bien formado, raiz <tags> y cada <prop> con name y type.
export class XmldomValidadorPlantillaAdapter implements ValidadorPlantillaPort {
  validar(contenido: string): void {
    if (contenido.trim() === '') throw new PlantillaInvalidaError('La plantilla esta vacia.');

    const errores: string[] = [];
    let documento: ReturnType<DOMParser['parseFromString']> | undefined;
    try {
      documento = new DOMParser({
        onError: (nivel, mensaje) => {
          if (nivel !== 'warning') errores.push(mensaje);
        },
      }).parseFromString(contenido, 'text/xml');
    } catch (error) {
      // Los errores fatales (etiquetas sin cerrar) se lanzan en vez de avisarse.
      errores.push(error instanceof Error ? error.message : String(error));
    }

    if (errores.length > 0) {
      throw new PlantillaInvalidaError(`La plantilla no es XML valido: ${errores[0]}`);
    }

    const raiz = documento?.documentElement;
    if (!raiz || raiz.nodeName !== 'tags') {
      throw new PlantillaInvalidaError('La plantilla debe tener <tags> como raiz.');
    }

    const props = raiz.getElementsByTagName('prop');
    if (props.length === 0) throw new PlantillaInvalidaError('La plantilla no tiene ningun <prop>.');

    for (let i = 0; i < props.length; i++) {
      const prop = props.item(i)!;
      if (!prop.getAttribute('name') || !prop.getAttribute('type')) {
        throw new PlantillaInvalidaError(`El <prop> numero ${i + 1} no tiene name o type.`);
      }
    }
  }
}
