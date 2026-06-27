import {
  TipoNovedadConfig,
  TipoNovedadSolicitud,
} from '../interfaces/solicitud-novedad.interface';

export const TIPOS_NOVEDAD_SOLICITUD: TipoNovedadConfig[] = [
  {
    id: 'movilidad',
    tipoNovedadId: 1,
    label: 'Movilidad',
    descripcion:
      'Traslado del cotizante desde otra EPS o cambio de régimen de afiliación.',
    documentos: [
      {
        id: 'mov-fua',
        nombre: 'Formato único de afiliación (FUA)',
        descripcion:
          'Formulario diligenciado y firmado por el cotizante y el aportante.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'FUA_movilidad_CC1234567890.pdf',
      },
      {
        id: 'mov-eps-anterior',
        nombre: 'Certificado de afiliación EPS anterior',
        descripcion:
          'Certificado emitido por la EPS de origen con fecha de afiliación y retiro.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Certificado_EPS_anterior.pdf',
      },
      {
        id: 'mov-documento-id',
        nombre: 'Documento de identidad del cotizante',
        descripcion: 'Copia legible del documento de identidad vigente.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Documento_cotizante.pdf',
      },
      {
        id: 'mov-carta-solicitud',
        nombre: 'Carta de solicitud de traslado',
        descripcion:
          'Carta firmada por el aportante solicitando el traslado del cotizante.',
        obligatorio: false,
        formatosPermitidos: ['PDF', 'DOCX'],
        ejemploNombreArchivo: 'Carta_solicitud_traslado.pdf',
      },
    ],
  },
  {
    id: 'licencia',
    tipoNovedadId: 3,
    label: 'Licencia Maternidad/Paternidad',
    descripcion:
      'Licencia de maternidad, paternidad u otra licencia remunerada.',
    documentos: [
      {
        id: 'lic-certificado-medico',
        nombre: 'Certificado médico de licencia',
        descripcion:
          'Certificado expedido por el médico tratante con diagnóstico y fechas.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Certificado_medico_licencia.pdf',
      },
      {
        id: 'lic-documento-id',
        nombre: 'Documento de identidad del cotizante',
        descripcion: 'Copia del documento de identidad del afiliado.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Documento_cotizante.pdf',
      },
      {
        id: 'lic-fua-novedad',
        nombre: 'Formato único de novedad',
        descripcion: 'Formulario de novedad de licencia debidamente diligenciado.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'FUA_novedad_licencia.pdf',
      },
      {
        id: 'lic-registro-nacimiento',
        nombre: 'Registro civil de nacimiento',
        descripcion:
          'Requerido para licencia de maternidad o paternidad, según corresponda.',
        obligatorio: false,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Registro_civil_nacimiento.pdf',
      },
    ],
  },
  {
    id: 'incapacidad',
    tipoNovedadId: 4,
    label: 'Incapacidad',
    descripcion:
      'Reporte de incapacidad temporal por enfermedad general o accidente.',
    documentos: [
      {
        id: 'inc-incapacidad-original',
        nombre: 'Incapacidad original (prescripción médica)',
        descripcion:
          'Documento original firmado por el médico con código de diagnóstico CIE-10.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Incapacidad_original.pdf',
      },
      {
        id: 'inc-documento-id',
        nombre: 'Documento de identidad del cotizante',
        descripcion: 'Copia del documento de identidad del afiliado.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Documento_cotizante.pdf',
      },
      {
        id: 'inc-historia-clinica',
        nombre: 'Historia clínica resumida',
        descripcion:
          'Resumen clínico que soporte el periodo de incapacidad reportado.',
        obligatorio: false,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Historia_clinica_resumida.pdf',
      },
      {
        id: 'inc-fua-novedad',
        nombre: 'Formato único de novedad',
        descripcion:
          'Formulario de novedad de incapacidad diligenciado por el aportante.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'FUA_novedad_incapacidad.pdf',
      },
    ],
  },
  {
    id: 'relacion-laboral',
    tipoNovedadId: 2,
    label: 'Relación Laboral (N06)',
    descripcion:
      'Vinculación o actualización de la relación laboral del cotizante.',
    documentos: [
      {
        id: 'rl-contrato',
        nombre: 'Contrato de trabajo o carta de vinculación',
        descripcion:
          'Documento que acredite la relación laboral entre aportante y cotizante.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'DOCX'],
        ejemploNombreArchivo: 'Contrato_trabajo.pdf',
      },
      {
        id: 'rl-documento-id',
        nombre: 'Documento de identidad del cotizante',
        descripcion: 'Copia del documento de identidad del afiliado.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Documento_cotizante.pdf',
      },
      {
        id: 'rl-fua',
        nombre: 'Formato único de afiliación (FUA)',
        descripcion:
          'Formulario de afiliación o novedad de relación laboral diligenciado.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'FUA_relacion_laboral.pdf',
      },
      {
        id: 'rl-certificado-anterior',
        nombre: 'Certificado de afiliación anterior',
        descripcion:
          'Solo si el cotizante proviene de otra EPS o cambió de tipo de cotizante.',
        obligatorio: false,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Certificado_afiliacion_anterior.pdf',
      },
    ],
  },
  {
    id: 'terminacion-relacion-laboral',
    tipoNovedadId: 5,
    label: 'Terminación Relación Laboral (N11)',
    descripcion:
      'Reporte de retiro del cotizante por terminación de la relación laboral con el aportante.',
    documentos: [
      {
        id: 'trl-fua-novedad',
        nombre: 'Formato único de novedad N11',
        descripcion:
          'Formulario de novedad de terminación de relación laboral debidamente diligenciado y firmado.',
        obligatorio: true,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'FUA_terminacion_N11.pdf',
      },
      {
        id: 'trl-carta-terminacion',
        nombre: 'Carta o documento de terminación del contrato',
        descripcion:
          'Documento firmado por el aportante que acredite la terminación de la relación laboral, con fecha de retiro.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'DOCX'],
        ejemploNombreArchivo: 'Carta_terminacion_contrato.pdf',
      },
      {
        id: 'trl-documento-id',
        nombre: 'Documento de identidad del cotizante',
        descripcion: 'Copia legible del documento de identidad del afiliado.',
        obligatorio: true,
        formatosPermitidos: ['PDF', 'JPG', 'PNG'],
        ejemploNombreArchivo: 'Documento_cotizante.pdf',
      },
      {
        id: 'trl-liquidacion',
        nombre: 'Liquidación laboral o finiquito',
        descripcion:
          'Documento de liquidación definitiva de prestaciones, si aplica.',
        obligatorio: false,
        formatosPermitidos: ['PDF'],
        ejemploNombreArchivo: 'Liquidacion_laboral.pdf',
      },
    ],
  },
];

export function getTipoNovedadConfig(
  id: TipoNovedadSolicitud,
): TipoNovedadConfig | undefined {
  return TIPOS_NOVEDAD_SOLICITUD.find((tipo) => tipo.id === id);
}
