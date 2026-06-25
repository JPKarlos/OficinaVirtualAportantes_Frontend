import * as XLSX from 'xlsx';
import { IncapacidadAportante } from '../interfaces/incapacidad-aportante.interface';
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

export function buildIdentificacionFromIncapacidad(
  registro: IncapacidadAportante | undefined,
): string {
  if (!registro) {
    return '—';
  }

  return formatIdentificacionCompletaAportante(
    registro.tipoDocAportante,
    registro.documentoAportante,
    registro.dvAportante,
  );
}

export function exportIncapacidadesToExcel(
  incapacidades: IncapacidadAportante[],
  identificacionAportante: string,
  nombreRazonSocial: string,
): void {
  const sheetRows: (string | number)[][] = [
    ['Identificación aportante', identificacionAportante],
    ['Razón social', nombreRazonSocial],
    [],
    [
      'Tipo_Documento',
      'Documento',
      'Apellido1',
      'Apellido2',
      'Nombre1',
      'Nombre2',
      'Genero',
      'FechaInicio',
      'FechaFin',
      'FechaRadicado',
      'BarCode',
      'Cod_Diagnostico',
      'Diagnostico',
      'Estado_Novedad',
      'ObservacionesRegistro',
      'TipoIncapacidad',
      'FechaPago',
      'PagoPor',
      'Comprobante',
      'Estado_Pago',
    ],
  ];

  for (const item of incapacidades) {
    sheetRows.push([
      item.tipoDocumento ?? '',
      item.documento ?? '',
      item.apellido1 ?? '',
      item.apellido2 ?? '',
      item.nombre1 ?? '',
      item.nombre2 ?? '',
      item.genero ?? '',
      formatDateValue(item.fechaInicio),
      formatDateValue(item.fechaFin),
      formatDateValue(item.fechaRadicado),
      item.barCode ?? '',
      item.codDiagnostico ?? '',
      item.diagnostico ?? '',
      item.estadoNovedad ?? '',
      item.observacionesRegistro ?? '',
      item.tipoIncapacidad ?? '',
      formatDateValue(item.fechaPago),
      item.pagoPor ?? '',
      item.comprobante ?? '',
      item.estadoPago ?? '',
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 30 },
    { wch: 18 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Incapacidades');

  const safeId = identificacionAportante.replace(/[^\dA-Za-z-]/g, '_');
  const fileName = `incapacidades_aportante_${safeId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
