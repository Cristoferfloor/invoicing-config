export const RUC = /^\d{10}00[1-9]$/;

// Tipos de comprobante con los codigos del sistema actual (types_helper.php).
export const TIPOS_COMPROBANTE = ['01', '01-E', '01-R', '03-L', '04', '05', '06', '07'] as const;

export function esTipoValido(tipo: string): boolean {
  return (TIPOS_COMPROBANTE as readonly string[]).includes(tipo);
}
