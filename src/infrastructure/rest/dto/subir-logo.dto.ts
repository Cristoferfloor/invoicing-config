import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// Campos de texto del multipart/form-data. La imagen la recibe
// FileInterceptor, no este DTO.
export class SubirLogoDto {
  @ApiPropertyOptional({ maxLength: 500, example: 'Logo nuevo 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}
