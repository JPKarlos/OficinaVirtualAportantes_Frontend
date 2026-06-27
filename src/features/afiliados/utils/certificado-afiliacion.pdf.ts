import { jsPDF } from 'jspdf';
import { AfiliadoAsociado } from '../interfaces/afiliado-asociado.interface';
import { formatIdentificacionCompletaAportante } from './afiliados-excel.export';

function formatFechaEspanol(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildIdentificacionAfiliado(afiliado: AfiliadoAsociado): string {
  const documento = afiliado.documento?.trim();
  if (!documento) {
    return '—';
  }

  const tipo = afiliado.tipo?.trim();
  return tipo ? `${tipo} ${documento}` : documento;
}

export function generateCertificadoAfiliacionPdf(afiliado: AfiliadoAsociado): void {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 25;

  const identificacionAportante = formatIdentificacionCompletaAportante(
    afiliado.tipoApt,
    afiliado.idenAportante,
    afiliado.dvAportante,
  );
  const nombreAfiliado = afiliado.nombreCompleto?.trim() || '—';
  const identificacionAfiliado = buildIdentificacionAfiliado(afiliado);
  const tipoCotizante = afiliado.tipoCotizante?.trim() || '—';
  const nombreRazonSocial = afiliado.nombreRazonSocial?.trim() || '—';
  const fechaExpedicion = formatFechaEspanol(new Date());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MALLAMAS EPS-I', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(14);
  doc.text('CERTIFICADO DE AFILIACIÓN', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('(Formato provisional)', pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const paragraphs = [
    'La Entidad Promotora de Salud Indígena MALLAMAS EPS-I certifica que:',
    `${nombreAfiliado}, identificado(a) con documento ${identificacionAfiliado}, se encuentra afiliado(a) al Régimen Contributivo de Salud, en calidad de ${tipoCotizante}, vinculado(a) al aportante ${identificacionAportante}, ${nombreRazonSocial}.`,
    'Lo anterior confirma la afiliación del cotizante ante esta Entidad Promotora de Salud, en relación con el aportante señalado.',
    'Se expide el presente certificado a solicitud del interesado, para acreditar la condición de afiliación descrita y para los trámites que el solicitante estime pertinentes.',
    `Fecha de expedición: ${fechaExpedicion}.`,
  ];

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 6;
  }

  const footerY = Math.max(y + 10, 240);
  doc.setDrawColor(0, 120, 60);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'Oficina Virtual Aportantes - Mallamas EPS-I',
    pageWidth / 2,
    footerY + 6,
    { align: 'center' },
  );

  const safeDoc = (afiliado.documento ?? 'afiliado').replace(/[^\dA-Za-z]/g, '_');
  const fileName = `certificado_afiliacion_${safeDoc}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
