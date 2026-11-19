import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

// Quien hace el cambio, para la auditoria: header X-Autor. Sin header,
// "postman".
export const Autor = createParamDecorator((_: unknown, contexto: ExecutionContext): string => {
  const autor = (contexto.switchToHttp().getRequest<Request>().header('x-autor') ?? '').trim().slice(0, 100);
  return autor === '' ? 'postman' : autor;
});
