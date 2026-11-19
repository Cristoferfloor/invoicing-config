import { Logo, NuevoLogo, ResumenLogo } from '../model/logo.model';

export const LOGOS_REPOSITORY = Symbol('LOGOS_REPOSITORY');

export interface LogosRepositoryPort {
  // Guarda como version siguiente, con su registro de auditoria.
  publicar(nuevo: NuevoLogo, autor: string): Promise<Logo>;
  vigente(empresaRuc: string): Promise<Logo | null>;
  // El que estaba vigente en esa fecha. Si todos son posteriores, el primero.
  vigenteEn(empresaRuc: string, fecha: Date): Promise<Logo | null>;
  versiones(empresaRuc: string): Promise<ResumenLogo[]>;
}
