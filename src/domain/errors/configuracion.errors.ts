export abstract class ErrorConfiguracion extends Error {
  abstract readonly codigo: string;

  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class EmpresaNoEncontradaError extends ErrorConfiguracion {
  readonly codigo = 'EMPRESA_NO_ENCONTRADA';
}

export class PlantillaNoEncontradaError extends ErrorConfiguracion {
  readonly codigo = 'PLANTILLA_NO_ENCONTRADA';
}

export class PlantillaInvalidaError extends ErrorConfiguracion {
  readonly codigo = 'PLANTILLA_INVALIDA';
}

export class LogoNoEncontradoError extends ErrorConfiguracion {
  readonly codigo = 'LOGO_NO_ENCONTRADO';
}

export class LogoInvalidoError extends ErrorConfiguracion {
  readonly codigo = 'LOGO_INVALIDO';
}

export class ConexionErpNoEncontradaError extends ErrorConfiguracion {
  readonly codigo = 'CONEXION_ERP_NO_ENCONTRADA';
}

export class ConexionErpInvalidaError extends ErrorConfiguracion {
  readonly codigo = 'CONEXION_ERP_INVALIDA';
}
