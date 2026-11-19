import { Logo, ResumenLogo } from '../../../domain/model/logo.model';
import { LogoEntity } from '../entities/logo.entity';

export function aResumenLogo(fila: LogoEntity): ResumenLogo {
  return {
    empresaRuc: fila.empresaRuc,
    version: fila.version,
    huella: fila.huella,
    tipo: fila.tipo,
    bytes: fila.bytes,
    nombreArchivo: fila.nombreArchivo,
    nota: fila.nota,
    subidoPor: fila.subidoPor,
    subidoEn: fila.subidoEn,
  };
}

export function aLogo(fila: LogoEntity): Logo {
  return { ...aResumenLogo(fila), contenido: fila.contenido };
}
