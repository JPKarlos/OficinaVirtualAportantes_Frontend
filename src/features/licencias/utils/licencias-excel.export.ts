import * as XLSX from 'xlsx';
import { LicenciaAportante } from '../interfaces/licencia-aportante.interface';
import { formatIdentificacionCompletaAportante } from '../../afiliados/utils/afiliados-excel.export';

export function formatDateValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatMoneyValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildIdentificacionFromLicencia(
  registro: LicenciaAportante | undefined,
): string {
  if (!registro) {
    return '—';
  }

  return formatIdentificacionCompletaAportante(
    registro.tipoDocumentoAportante,
    registro.documentoAportante,
    null,
  );
}

export function exportLicenciasToExcel(
  licencias: LicenciaAportante[],
  identificacionAportante: string,
  nombreRazonSocial: string,
): void {
  const sheetRows: (string | number)[][] = [
    ['Identificación aportante', identificacionAportante],
    ['Razón social', nombreRazonSocial],
    [],
    [
      'Codigo_EPS',
      'Fecha_radicacion',
      'TipoDocumento',
      'documento',
      'apellido1',
      'apellido2',
      'nombre1',
      'nombre2',
      'Salario',
      'Tipo_salario',
      'FechaInicio',
      'FechaFinLicencia',
      'Dias_Reconocer',
      'FechaPago',
      'Pagada',
      'Vr_a_pagar',
      'Radicacion',
      'DiasGestacion',
      'Dias_Prematuro',
      'Fecha_parto',
      'FechaPP',
      'EstadoNovedad',
      'NroComprobante',
    ],
  ];

  for (const item of licencias) {
    sheetRows.push([
      item.codigoEps ?? '',
      formatDateValue(item.fechaRadicacion),
      item.tipoDocumento ?? '',
      item.documento ?? '',
      item.apellido1 ?? '',
      item.apellido2 ?? '',
      item.nombre1 ?? '',
      item.nombre2 ?? '',
      item.salario ?? '',
      item.tipoSalario ?? '',
      formatDateValue(item.fechaInicio),
      formatDateValue(item.fechaFinLicencia),
      item.diasReconocer ?? '',
      formatDateValue(item.fechaPago),
      item.pagada ?? '',
      item.vrAPagar ?? '',
      item.radicacion ?? '',
      item.diasGestacion ?? '',
      item.diasPrematuro ?? '',
      formatDateValue(item.fechaParto),
      formatDateValue(item.fechaPp),
      item.estadoNovedad ?? '',
      item.nroComprobante ?? '',
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Licencias');

  const safeId = identificacionAportante.replace(/[^\dA-Za-z-]/g, '_');
  const fileName = `licencias_aportante_${safeId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
