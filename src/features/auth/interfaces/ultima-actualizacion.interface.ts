export interface UltimaActualizacionResponse {
  ultimaActualizacionId: number;
  aportanteId: number;
  idenAportante: string;
  fechaUltimaActualizacion: string;
  mesesDesdeUltimaActualizacion: number | null;
  nombreRazonSocial: string;
}

export interface ValidationMessageConfig {
  title: string;
  message: string;
  buttonText: string;
  buttonAction: 'update' | 'register' | 'create-aportante' | 'update-ultima-actualizacion';
  showButton: boolean;
  colorScheme: 'register' | 'update';
}


