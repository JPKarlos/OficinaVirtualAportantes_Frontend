export interface AfiliadoAsociado {
  historicoId: number;
  afiliadoId: number;
  tipo: string | null;
  documento: string | null;
  apellido1: string | null;
  apellido2: string | null;
  nombre1: string | null;
  nombre2: string | null;
  nombreCompleto: string;
  codTipCot: string | null;
  tipoCotizante: string | null;
  tipoApt: string | null;
  idenAportante: string | null;
  dvAportante: string | null;
  nombreRazonSocial: string | null;
  aportanteId: number | null;
  estadoRelacionLaboral: number | null;
}

export interface AfiliadosAsociadosResponse {
  aportanteId: number;
  total: number;
  afiliados: AfiliadoAsociado[];
}
