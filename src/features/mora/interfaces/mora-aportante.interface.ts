export interface MoraAportanteRegistro {
  anio: number | null;
  numMes: number | null;
  fechaMaximoPago: string | null;
  tipoDocCotizante: string | null;
  documento: string;
  apellido1: string | null;
  apellido2: string | null;
  nombre1: string | null;
  nombre2: string | null;
  nombreCompleto: string;
  codTipCot: string | null;
  tipoCotizante: string | null;
  codEstadoAfiliacion: string | null;
  desRegimen: string | null;
  correoElectronicoCotizante: string | null;
  telefonoCotizante: string | null;
  valorPeriodo: number | null;
  cantidadRegistros: number | null;
  tipo: string | null;
  idenAportante: string | null;
  dvAportante: string | null;
  nombreRazonSocial: string | null;
  correoElectronicoAportante: string | null;
  telefonoAportante: string | null;
}

export interface MoraAportanteResponse {
  aportanteId: number;
  total: number;
  registros: MoraAportanteRegistro[];
}
