import { plainToInstance } from 'class-transformer';
import { IsBase64, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, validateSync } from 'class-validator';

// Variables que el servicio necesita para arrancar. Si falta alguna o esta
// mal, no arranca y dice cual.
export class VariablesEntorno {
  @Matches(/^postgres(ql)?:\/\/.+/, { message: 'CONFIG_PG_URL debe ser postgres://usuario:clave@host:puerto/base' })
  CONFIG_PG_URL!: string;

  @IsString()
  @IsNotEmpty({ message: 'CONFIG_ADMIN_TOKEN es obligatorio (header X-Token-Admin).' })
  CONFIG_ADMIN_TOKEN!: string;

  @IsBase64({}, { message: 'CONFIG_MASTER_KEY debe ser base64 de 32 bytes (openssl rand -base64 32).' })
  CONFIG_MASTER_KEY!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3003;
}

export function validarEntorno(entorno: Record<string, unknown>): VariablesEntorno {
  const variables = plainToInstance(VariablesEntorno, entorno, { enableImplicitConversion: true });
  const errores = validateSync(variables);
  if (errores.length > 0) {
    const detalle = errores.flatMap((e) => Object.values(e.constraints ?? {})).join('; ');
    throw new Error(`Variables de entorno invalidas: ${detalle}`);
  }
  return variables;
}
