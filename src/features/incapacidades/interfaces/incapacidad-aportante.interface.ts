export interface IncapacidadAportante {
  rowKey: string;
  incapacidadId: number;
  afiliadoId: number | null;
  tipoDocumento: string | null;
  documento: string | null;
  apellido1: string | null;
  apellido2: string | null;
  nombre1: string | null;
  nombre2: string | null;
  nombreCompleto: string;
  genero: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaRadicado: string | null;
  barCode: string | null;
  codDiagnostico: string | null;
  diagnostico: string | null;
  estadoNovedad: string | null;
  observacionesRegistro: string | null;
  nombreRazonSocial: string | null;
  tipoIncapacidad: string | null;
  fechaPago: string | null;
  pagoPor: string | null;
  comprobante: string | null;
  estadoPago: string | null;
  aportanteId: number | null;
  tipoDocAportante: string | null;
  documentoAportante: string | null;
  dvAportante: string | null;
}

export interface IncapacidadesAportanteResponse {
  aportanteId: number;
  total: number;
  incapacidades: IncapacidadAportante[];
}
