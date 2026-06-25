export interface LicenciaAportante {
  rowKey: string;
  codigoEps: string | null;
  fechaRadicacion: string | null;
  tipoDocumento: string | null;
  documento: string | null;
  apellido1: string | null;
  apellido2: string | null;
  nombre1: string | null;
  nombre2: string | null;
  nombreCompleto: string;
  tipoDocumentoAportante: string | null;
  documentoAportante: string | null;
  nombreRazonSocial: string | null;
  salario: number | null;
  tipoSalario: string | null;
  fechaInicio: string | null;
  fechaFinLicencia: string | null;
  diasReconocer: number | null;
  fechaPago: string | null;
  pagada: string | null;
  vrAPagar: number | null;
  radicacion: string | null;
  tipoPrestacionEconomica: string | null;
  tipoLicencia: string | null;
  diasGestacion: number | null;
  diasPrematuro: number | null;
  fechaParto: string | null;
  fechaPp: string | null;
  estadoNovedad: string | null;
  nroComprobante: string | null;
  aportanteId: number | null;
}

export interface LicenciasAportanteResponse {
  aportanteId: number;
  total: number;
  licencias: LicenciaAportante[];
}
