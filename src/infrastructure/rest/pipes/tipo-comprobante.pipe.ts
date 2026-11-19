import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { TIPOS_COMPROBANTE, esTipoValido } from '../../../domain/reglas';

@Injectable()
export class TipoComprobantePipe implements PipeTransform<string, string> {
  transform(tipo: string): string {
    if (!esTipoValido(tipo)) {
      throw new BadRequestException(`Tipo de comprobante invalido. Use uno de: ${TIPOS_COMPROBANTE.join(', ')}.`);
    }
    return tipo;
  }
}
