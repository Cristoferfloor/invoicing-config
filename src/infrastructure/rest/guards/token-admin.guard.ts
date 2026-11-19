import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { Request } from 'express';

export const TOKEN_ADMIN = Symbol('TOKEN_ADMIN');

// Mientras no exista el panel con usuarios, la configuracion se protege con
// un token del servicio en el header X-Token-Admin.
@Injectable()
export class TokenAdminGuard implements CanActivate {
  constructor(@Inject(TOKEN_ADMIN) private readonly esperado: string) {}

  canActivate(contexto: ExecutionContext): boolean {
    const recibido = contexto.switchToHttp().getRequest<Request>().header('x-token-admin') ?? '';
    if (!timingSafeEqual(this.resumen(recibido), this.resumen(this.esperado))) {
      throw new ForbiddenException('Token de administracion invalido.');
    }
    return true;
  }

  private resumen(valor: string): Buffer {
    return createHash('sha256').update(valor).digest();
  }
}
