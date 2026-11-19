import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// Campos de texto del multipart/form-data. El archivo no va aqui: lo recibe
// FileInterceptor, y un campo sin validaciones seria rechazado por el
// ValidationPipe (forbidNonWhitelisted).
export class SubirPlantillaDto {
  @ApiPropertyOptional({ maxLength: 500, example: 'Plantilla actual en servidor' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}
