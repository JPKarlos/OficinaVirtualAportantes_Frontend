export type EstadoActualizacionAportante =
  | 'SIN_APORTANTE'
  | 'SIN_ULTIMA_ACTUALIZACION'
  | 'MENOR_6_MESES'
  | 'MAYOR_6_MESES';

export interface ActualizacionAportanteStatus {
  tieneAportante: boolean;
  tieneUltimaActualizacion: boolean;
  aportanteId: number | null;
  estado: EstadoActualizacionAportante;
  mesesDesdeUltimaActualizacion: number | null;
  fechaUltimaActualizacion: string | null;
  nombreRazonSocial: string | null;
  idenAportante: string | null;
}
