export type TipoNovedadSolicitud =
  | 'movilidad'
  | 'licencia'
  | 'incapacidad'
  | 'relacion-laboral'
  | 'terminacion-relacion-laboral';

export interface DocumentoRequerido {
  id: string;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  formatosPermitidos: string[];
  ejemploNombreArchivo: string;
}

export interface TipoNovedadConfig {
  id: TipoNovedadSolicitud;
  tipoNovedadId: number;
  label: string;
  descripcion: string;
  documentos: DocumentoRequerido[];
}

export interface SolicitudAportante {
  solicitudesId: number;
  radicacion: string | null;
  fechaRadicacion: string | null;
  estadoSolicitud: string | null;
  observacion: string | null;
  rutaSoportes: string | null;
  cantidadDocumentosCargados: number | null;
  tipoNovedad: string;
  nombreRazonSocial: string | null;
  aportanteId: number | null;
}

export interface SolicitudesAportanteResponse {
  aportanteId: number;
  total: number;
  solicitudes: SolicitudAportante[];
}

export interface CreateSolicitudResponse {
  solicitud: SolicitudAportante;
}
