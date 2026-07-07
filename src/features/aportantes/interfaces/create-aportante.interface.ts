import { ActualizacionAportanteStatus } from '../../auth/interfaces/actualizacion-aportante-status.interface';

export interface CreateAportanteRequest {
  nombreRazonSocial: string;
  apidentificacionId: number;
  idenAportante: string;
  dvAportante?: string | null;
  codSucDep?: string | null;
  nomSucDep?: string | null;
  claseAportanteIde: number;
  naturalezaAportanteIde: number;
  tipoPersonaIde: number;
  formaPresentacionIde?: number | null;
  direccionCorres?: string | null;
  direccionAlterna?: string | null;
  municipioIde: number;
  ciiuClaseId: number;
  telefono?: string | null;
  telefono2?: string | null;
  celular?: string | null;
  celular2?: string | null;
  fax?: string | null;
  email?: string | null;
  email2?: string | null;
  idenRepLegal?: string | null;
  dvRepLegal?: string | null;
  rlIdentificacionId: number;
  apellido1RepLeg?: string | null;
  apellido2RepLeg?: string | null;
  nombre1RepLeg?: string | null;
  nombre2RepLeg?: string | null;
  fechaInicio?: string | null;
  tipoAccionIde?: number | null;
  fechaFin?: string | null;
  tipoAportanteContIde?: number | null;
}

export interface CreateAportanteResponse {
  aportanteId: number;
  ultimaActualizacionId: number;
  estadoActualizacion: ActualizacionAportanteStatus;
}

export type UpdateAportanteRequest = CreateAportanteRequest;
export type UpdateAportanteResponse = CreateAportanteResponse;
export type UpdateMisDatosRequest = CreateAportanteRequest;
export type UpdateMisDatosResponse = CreateAportanteResponse;
