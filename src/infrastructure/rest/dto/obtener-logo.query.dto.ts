import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class ObtenerLogoQueryDto {
  @ApiPropertyOptional({
    description: 'Devuelve el logo que estaba vigente en esa fecha (para reimprimir un RIDE viejo).',
    example: '2026-09-17T08:18:40-05:00',
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'vigenteEn debe ser una fecha ISO 8601.' })
  vigenteEn?: string;
}
