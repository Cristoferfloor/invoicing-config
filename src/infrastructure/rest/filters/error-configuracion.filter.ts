import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import { ErrorConfiguracion } from '../../../domain/errors/configuracion.errors';

const ESTADO_HTTP: Record<string, HttpStatus> = {
  EMPRESA_NO_ENCONTRADA: HttpStatus.NOT_FOUND,
  PLANTILLA_NO_ENCONTRADA: HttpStatus.NOT_FOUND,
  PLANTILLA_INVALIDA: HttpStatus.UNPROCESSABLE_ENTITY,
  LOGO_NO_ENCONTRADO: HttpStatus.NOT_FOUND,
  LOGO_INVALIDO: HttpStatus.UNPROCESSABLE_ENTITY,
  CONEXION_ERP_NO_ENCONTRADA: HttpStatus.NOT_FOUND,
  CONEXION_ERP_INVALIDA: HttpStatus.BAD_REQUEST,
};

// Errores del dominio -> { estado: 'RECHAZADO', error, mensaje }.
@Catch(ErrorConfiguracion)
export class ErrorConfiguracionFilter implements ExceptionFilter<ErrorConfiguracion> {
  private readonly logger = new Logger(ErrorConfiguracionFilter.name);

  catch(excepcion: ErrorConfiguracion, host: ArgumentsHost): void {
    this.logger.warn(JSON.stringify({ evento: 'peticion_rechazada', error: excepcion.codigo, mensaje: excepcion.message }));
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(ESTADO_HTTP[excepcion.codigo] ?? HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ estado: 'RECHAZADO', error: excepcion.codigo, mensaje: excepcion.message });
  }
}
