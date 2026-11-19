import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export class GuardarConexionErpDto {
  @ApiProperty({ example: 'http://51.222.195.199:8098/.erpGI/WS/index.php/rootrouters/' })
  @IsUrl(
    { require_tld: false, require_protocol: true, protocols: ['http', 'https'] },
    { message: 'url debe ser la direccion del web service del ERP (http o https).' },
  )
  url!: string;

  @ApiPropertyOptional({ description: 'Obligatorio al crear. Al actualizar, si no se envia se conserva el guardado.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  token?: string;

  @ApiProperty()
  @IsBoolean()
  activa!: boolean;

  @ApiProperty({ minimum: 15, maximum: 3600, example: 20 })
  @IsInt()
  @Min(15, { message: 'intervaloSegundos minimo 15, para no saturar el ERP del cliente.' })
  @Max(3600)
  intervaloSegundos!: number;
}
