export interface CreateAportanteForm {
  apidentificacionId: number | null;
  idenAportante: string;
  dvAportante: string;
  nombreRazonSocial: string;
  rlIdentificacionId: number | null;
  telefono: string;
  email: string;
  direccionCorres: string;
  municipioIde: number | null;
  ciiuClaseId: number | null;
  claseAportanteIde: number | null;
  tipoPersonaIde: number | null;
}
