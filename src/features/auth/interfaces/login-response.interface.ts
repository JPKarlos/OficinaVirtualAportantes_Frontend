import { User } from './user.interface';
import { ActualizacionAportanteStatus } from './actualizacion-aportante-status.interface';

export interface LoginResponse {
  user: User;
  token: string;
  estadoActualizacion?: ActualizacionAportanteStatus;
}