export interface Departamento {
  departamentoIde: number;
  codigo: string;
  descripcion: string;
}

export interface Municipio {
  municipioIde: number;
  codigo: string;
  descripcion: string;
  departamentoIde: number;
  zeDispGeo: number | null;
  zonaDispGeoContr: number | null;
  cobertura: number | null;
  departamento?: Departamento;
}
