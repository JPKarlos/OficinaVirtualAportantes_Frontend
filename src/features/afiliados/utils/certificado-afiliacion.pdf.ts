import { jsPDF } from 'jspdf';
import { AfiliadoAsociado } from '../interfaces/afiliado-asociado.interface';
import {
  drawHeader,
  loadPdfAssets,
  formatFechaCertificadoEspanol,
} from '../../mora/utils/pdf-common.util';
import {
  formatEstadoRelacionLaboral,
  formatIdentificacionCompletaAportante,
} from './afiliados-excel.export';

const MARGIN = 20;
const BOTTOM_MARGIN = 34;
const FOOTER_HEIGHT = 28;
const HEADER_TITLE = 'OFICINA VIRTUAL\nCERTIFICADO DE AFILIACIÓN';
const HEADER_CODE = 'AS-FR-056';

interface CertificadoAfiliacionLayout {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  maxWidth: number;
}

function drawAfiliacionFooter(doc: jsPDF, y: number): void {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  // Línea separadora
  doc.setDrawColor(0, 120, 60);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text(
    'Carrera 1 Norte 4 - 56 Avenida Panamericana  Tel: (602) 773 87 25 - 773 87 26 - 773 29 74 - 725 61 37  Ipiales (Nariño)',
    pageWidth / 2,
    y,
    { align: 'center', maxWidth },
  );
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'E-Mail: contributivo@mallamaseps.com  prestacioneseconomicas@mallamaseps.com  Página Web: www.mallamaseps.com  Línea gratuita: 018000 913 701  NIT: 837.000.084-5',
    pageWidth / 2,
    y,
    { align: 'center', maxWidth },
  );

  doc.setTextColor(0, 0, 0);
}

function drawPageFooter(layout: CertificadoAfiliacionLayout): void {
  const { doc, pageHeight } = layout;
  const footerY = pageHeight - FOOTER_HEIGHT;
  drawAfiliacionFooter(doc, footerY);
}

function ensureSpace(
  layout: CertificadoAfiliacionLayout,
  assets: Awaited<ReturnType<typeof loadPdfAssets>>,
  y: number,
  neededSpace: number,
): number {
  const { doc, pageHeight } = layout;

  if (y + neededSpace <= pageHeight - BOTTOM_MARGIN) {
    return y;
  }

  doc.addPage();
  let newY = drawHeader(doc, assets, {
    titulo: HEADER_TITLE,
    codigo: HEADER_CODE,
    mostrarLogoSupersalud: false,
  });
  drawPageFooter(layout);
  newY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('CERTIFICADO DE AFILIACIÓN', layout.pageWidth / 2, newY, {
    align: 'center',
  });
  newY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'Documento generado a través de la Oficina Virtual Aportantes - Mallamas EPS-I',
    layout.pageWidth / 2,
    newY,
    { align: 'center' },
  );
  newY += 10;

  return newY;
}

function buildIdentificacionAfiliado(afiliado: AfiliadoAsociado): string {
  const documento = afiliado.documento?.trim();
  if (!documento) {
    return '—';
  }

  const tipo = afiliado.tipo?.trim();
  return tipo ? `${tipo} ${documento}` : documento;
}

function formatFechaExpedicion(dia: string, mes: string, anio: string): string {
  return `${dia} días del mes de ${mes} del ${anio}`;
}

function formatFechaVinculacion(value: string | null | undefined): string {
  const fecha = value?.trim();
  if (!fecha) {
    return '—';
  }

  // Acepta formatos YYYY-MM-DD, YYYY/MM/DD o DD/MM/YYYY
  let date: Date | null = null;

  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(fecha)) {
    const [y, m, d] = fecha.split(/[-/]/).map(Number);
    date = new Date(y, (m ?? 1) - 1, d ?? 1);
  } else if (/^\d{2}[-/]\d{2}[-/]\d{4}/.test(fecha)) {
    const [d, m, y] = fecha.split(/[-/]/).map(Number);
    date = new Date(y, (m ?? 1) - 1, d ?? 1);
  } else {
    date = new Date(fecha);
  }

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  return `${date.getDate()} de ${meses[date.getMonth()] ?? ''} de ${date.getFullYear()}`;
}

export async function generateCertificadoAfiliacionPdf(
  afiliado: AfiliadoAsociado,
): Promise<void> {
  const assets = await loadPdfAssets(false);
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = 0;

  const layout: CertificadoAfiliacionLayout = {
    doc,
    pageWidth,
    pageHeight,
    maxWidth,
  };

  y = drawHeader(doc, assets, {
    titulo: HEADER_TITLE,
    codigo: HEADER_CODE,
    mostrarLogoSupersalud: false,
  });
  drawPageFooter(layout);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('CERTIFICADO DE AFILIACIÓN', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'Documento generado a través de la Oficina Virtual Aportantes - Mallamas EPS-I',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  y += 10;
  doc.setTextColor(30, 30, 30);

  const nombreAfiliado = afiliado.nombreCompleto?.trim() || '—';
  const identificacionAfiliado = buildIdentificacionAfiliado(afiliado);
  const tipoCotizante = afiliado.tipoCotizante?.trim() || '—';
  const regimen = afiliado.desRegimen?.trim() || '—';
  const fechaVinculacion = formatFechaVinculacion(afiliado.fechafiliacion);
  const estado = formatEstadoRelacionLaboral(afiliado.estadoRelacionLaboral) || '—';
  const identificacionAportante = formatIdentificacionCompletaAportante(
    afiliado.tipoApt,
    afiliado.idenAportante,
    afiliado.dvAportante,
  );
  const nombreRazonSocial = afiliado.nombreRazonSocial?.trim() || '—';
  const expDate = formatFechaCertificadoEspanol(new Date());
  const fechaExpedicion = formatFechaExpedicion(
    expDate.dia,
    expDate.mes,
    expDate.anio,
  );

  const paragraph1 =
    'La Entidad Promotora de Salud Indígena MALLAMAS EPS-I certifica que:';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const lines1 = doc.splitTextToSize(paragraph1, maxWidth);
  doc.text(lines1, pageWidth / 2, y, { align: 'center' });
  y += lines1.length * 4.5 + 6;

  // Tabla de datos del afiliado
  const tableHeaders = ['Campo', 'Detalle'];
  const tableRows: [string, string][] = [
    ['Afiliado(a)', nombreAfiliado],
    ['Tipo de Documento', afiliado.tipo?.trim() || '—'],
    ['Número de Documento', afiliado.documento?.trim() || '—'],
    ['Régimen', regimen],
    ['Estado', estado],
    ['Tipo de cotizante', tipoCotizante],
    ['Fecha de vinculación', fechaVinculacion],
    ['NIT Aportante', identificacionAportante],
    ['Aportante', nombreRazonSocial],
  ];

  const colWidths = [55, maxWidth - 55];
  const headerRowHeight = 8;
  const dataRowHeight = 7;

  // Asegurar espacio para la tabla completa
  y = ensureSpace(
    layout,
    assets,
    y,
    headerRowHeight + dataRowHeight * tableRows.length,
  );

  doc.setDrawColor(0);
  doc.setLineWidth(0.2);

  // Encabezados de la tabla
  let x = MARGIN;
  for (let i = 0; i < tableHeaders.length; i++) {
    doc.rect(x, y, colWidths[i], headerRowHeight);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(tableHeaders[i], x + colWidths[i] / 2, y + 5.5, {
      align: 'center',
    });
    x += colWidths[i];
  }
  y += headerRowHeight;

  // Filas de datos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  for (const [campo, detalle] of tableRows) {
    y = ensureSpace(layout, assets, y, dataRowHeight);

    x = MARGIN;

    // Celda campo (negrita)
    doc.rect(x, y, colWidths[0], dataRowHeight);
    doc.setFont('helvetica', 'bold');
    doc.text(campo, x + 2, y + 4.5);
    x += colWidths[0];

    // Celda detalle
    doc.rect(x, y, colWidths[1], dataRowHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(detalle, x + 2, y + 4.5);
    x += colWidths[1];

    y += dataRowHeight;
  }

  y += 8;

  const paragraph2 =
    'Se expide el presente certificado a solicitud del interesado, para acreditar la condición ' +
    'de afiliación descrita y para los trámites que el solicitante estime pertinentes.';

  const lines2 = doc.splitTextToSize(paragraph2, maxWidth);
  const expParagraph = `Fecha de expedición: ${fechaExpedicion}.`;

  y = ensureSpace(
    layout,
    assets,
    y,
    lines2.length * 4.5 + 6 + 12,
  );

  doc.text(lines2, pageWidth / 2, y, { align: 'center' });
  y += lines2.length * 4.5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.text(expParagraph, pageWidth / 2, y, { align: 'center' });

  const safeDoc =
    (afiliado.documento ?? 'afiliado').replace(/[^\dA-Za-z]/g, '_') ||
    'afiliado';
  const fileName = `certificado_afiliacion_${safeDoc}.pdf`;
  doc.save(fileName);
}