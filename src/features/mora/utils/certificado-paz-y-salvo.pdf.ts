import { jsPDF } from 'jspdf';
import {
  drawHeader,
  loadPdfAssets,
  addFooterNotes,
  addFooterContact,
  formatFechaCertificadoEspanol,
  getNombreCoordinadorMovilidad,
} from './pdf-common.util';

export interface CertificadoPazYSalvoData {
  razonSocial: string;
  identificacion: string;
}

export async function generateCertificadoPazYSalvoPdf(
  razonSocial: string,
  identificacion: string,
): Promise<void> {
  const assets = await loadPdfAssets();
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 0;

  y = drawHeader(doc, assets, {
    titulo: 'CERTIFICADO PAZ Y SALVO – OFICINA VIRTUAL',
    codigo: 'AS-FR-055',
    mostrarLogoSupersalud: false,
  });
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(
    'LA COORDINACIÓN DE MOVILIDAD DE MALLAMAS EPS-I',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  y += 7;

  doc.setFontSize(11);
  doc.text('CERTIFICA:', pageWidth / 2, y, { align: 'center' });
  y += 8;

  const fechaCorte = formatFechaCertificadoEspanol(new Date());
  const fechaEmision = formatFechaCertificadoEspanol(new Date());
  const nombreCoordinador = getNombreCoordinadorMovilidad();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const paragraph1 =
    'Que, una vez revisado en el Sistema de Información de MALLAMAS EPS-I, se encontró que el aportante ' + 
    razonSocial +
    ', con número de Identificación ' +
    identificacion +
    ` se encuentra a PAZ Y SALVO con los aportes al Sistema General de Seguridad Social en Salud del Régimen Contributivo, hasta el día ${fechaCorte.dia} del mes de ${fechaCorte.mes} del ${fechaCorte.anio}.`;

  const lines1 = doc.splitTextToSize(paragraph1, maxWidth);
  doc.text(lines1, margin, y);
  y += lines1.length * 4.5 + 8;

  const paragraph2 = `El presente certificado se expide por solicitud del interesado a los ${fechaEmision.dia} (${fechaEmision.diaEnLetras}) días del mes de ${fechaEmision.mes} del ${fechaEmision.anio}.`;

  const lines2 = doc.splitTextToSize(paragraph2, maxWidth);
  doc.text(lines2, margin, y);
  y += lines2.length * 4.5 + 12;

  const firmaY = Math.min(y + 25, pageHeight - 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(nombreCoordinador, pageWidth / 2, firmaY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Coordinador de Movilidad', pageWidth / 2, firmaY + 5, {
    align: 'center',
  });
  doc.text('Mallamas EPS-I', pageWidth / 2, firmaY + 10, { align: 'center' });

  const footerStart = Math.max(firmaY + 18, pageHeight - 58);
  addFooterNotes(doc, footerStart);
  addFooterContact(doc, footerStart + 24);

  const safeId = identificacion.replace(/[^\dA-Za-z-]/g, '_') || 'aportante';
  doc.save(`certificado_paz_y_salvo_${safeId}.pdf`);
}