import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { RUC } from '../../../domain/reglas';

@Injectable()
export class RucPipe implements PipeTransform<string, string> {
  transform(ruc: string): string {
    if (!RUC.test(ruc)) throw new BadRequestException('El RUC debe tener 13 digitos y terminar en 001.');
    return ruc;
  }
}
