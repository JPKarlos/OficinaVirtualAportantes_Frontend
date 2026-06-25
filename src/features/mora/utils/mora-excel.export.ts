import * as XLSX from 'xlsx';
import { MoraAportanteRegistro } from '../interfaces/mora-aportante.interface';
import { formatIdentificacionCompletaAportante } from '../../afiliados/utils/afiliados-excel.export';

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

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

export function exportMoraToExcel(
  registros: MoraAportanteRegistro[],
  identificacionAportante: string,
  nombreRazonSocial: string,
): void {
  const sheetRows: (string | number)[][] = [
    ['Identificación aportante', identificacionAportante],
    ['Razón social', nombreRazonSocial],
    [],
    [
      'Año',
      'Mes',
      'Tipo doc.',
      'Documento',
      'Nombre completo',
      'Tipo cotizante',
      'Régimen',
      'Estado afiliación',
      'Fecha máx. pago',
      'Valor período',
      'Cant. registros',
    ],
  ];

  for (const registro of registros) {
    sheetRows.push([
      registro.anio ?? '',
      registro.numMes ?? '',
      registro.tipoDocCotizante ?? '',
      registro.documento ?? '',
      registro.nombreCompleto ?? '',
      registro.tipoCotizante ?? '',
      registro.desRegimen ?? '',
      registro.codEstadoAfiliacion ?? '',
      formatDateValue(registro.fechaMaximoPago),
      registro.valorPeriodo ?? '',
      registro.cantidadRegistros ?? '',
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 6 },
    { wch: 10 },
    { wch: 18 },
    { wch: 40 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mora');

  const safeId = identificacionAportante.replace(/[^\dA-Za-z-]/g, '_');
  const fileName = `mora_aportante_${safeId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function buildIdentificacionFromRegistro(
  registro: MoraAportanteRegistro | undefined,
): string {
  if (!registro) {
    return '—';
  }

  return formatIdentificacionCompletaAportante(
    registro.tipo,
    registro.idenAportante,
    registro.dvAportante,
  );
}
