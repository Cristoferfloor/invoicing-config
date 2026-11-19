import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class GuardarEmpresaDto {
  @ApiProperty({ example: 'ROOTS Y ROUTES S.A.S', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  razonSocial!: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  nombreComercial?: string;

  @ApiProperty({ example: 'Santo Domingo, Via a Esmeraldas km 2 1/2', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  direccionMatriz!: string;

  @ApiProperty({ enum: [1, 2], description: '1 pruebas, 2 produccion' })
  @IsIn([1, 2], { message: 'ambiente debe ser 1 (pruebas) o 2 (produccion).' })
  ambiente!: 1 | 2;

  @ApiProperty()
  @IsBoolean()
  obligadoContabilidad!: boolean;

  @ApiPropertyOptional({ description: 'Numero de resolucion', example: '12345' })
  @IsOptional()
  @Matches(/^\d{1,13}$/, { message: 'contribuyenteEspecial debe ser el numero de resolucion.' })
  contribuyenteEspecial?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  agenteRetencion?: string;

  @ApiPropertyOptional({ enum: ['RIMPE_EMPRENDEDOR', 'RIMPE_NEGOCIO_POPULAR'] })
  @IsOptional()
  @IsIn(['RIMPE_EMPRENDEDOR', 'RIMPE_NEGOCIO_POPULAR'])
  regimen?: string;
}
