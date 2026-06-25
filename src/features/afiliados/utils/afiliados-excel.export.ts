import * as XLSX from 'xlsx';
import { AfiliadoAsociado } from '../interfaces/afiliado-asociado.interface';

export function formatEstadoRelacionLaboral(
  value: number | null | undefined,
): string {
  if (value === 1) {
    return 'Activa';
  }

  if (value === 0) {
    return 'Terminada';
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function formatIdentificacionAportante(
  idenAportante: string | null | undefined,
  dvAportante: string | null | undefined,
): string {
  const iden = idenAportante?.trim();
  if (!iden) {
    return '—';
  }

  const dv = dvAportante?.trim();
  return dv ? `${iden}-${dv}` : iden;
}

export function formatIdentificacionCompletaAportante(
  tipoApt: string | null | undefined,
  idenAportante: string | null | undefined,
  dvAportante: string | null | undefined,
): string {
  const numero = formatIdentificacionAportante(idenAportante, dvAportante);
  if (numero === '—') {
    return '—';
  }

  const tipo = tipoApt?.trim();
  return tipo ? `${tipo} ${numero}` : numero;
}

export function exportAfiliadosToExcel(
  afiliados: AfiliadoAsociado[],
  identificacionAportante: string,
  nombreRazonSocial: string,
): void {
  const sheetRows: (string | number)[][] = [
    ['Identificación aportante', identificacionAportante],
    ['Razón social', nombreRazonSocial],
    [],
    [
      'Tipo',
      'Documento',
      'Nombre completo',
      'Tipo cotizante',
      'Estado relación laboral',
    ],
  ];

  for (const afiliado of afiliados) {
    sheetRows.push([
      afiliado.tipo ?? '',
      afiliado.documento ?? '',
      afiliado.nombreCompleto ?? '',
      afiliado.tipoCotizante ?? '',
      formatEstadoRelacionLaboral(afiliado.estadoRelacionLaboral),
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 40 },
    { wch: 22 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Afiliados');

  const safeId = identificacionAportante.replace(/[^\dA-Za-z-]/g, '_');
  const fileName = `afiliados_aportante_${safeId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
