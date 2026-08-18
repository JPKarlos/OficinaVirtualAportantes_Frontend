import { jsPDF } from 'jspdf';
import { MoraAportanteRegistro } from '../interfaces/mora-aportante.interface';
import {
  drawHeader,
  loadPdfAssets,
  addFooterNotes,
  addFooterContact,
  formatFechaCertificadoEspanol,
  getNombreCoordinadorMovilidad,
} from './pdf-common.util';

function buildNombreCompletoCotizante(parts: {
  apellido1?: string | null;
  apellido2?: string | null;
  nombre1?: string | null;
  nombre2?: string | null;
}): string {
  return [parts.apellido1, parts.apellido2, parts.nombre1, parts.nombre2]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ');
}

function buildDocumentoCotizante(
  tipoDocCotizante?: string | null,
  documento?: string | null,
): string {
  const doc = documento?.trim() ?? '';
  const tipo = tipoDocCotizante?.trim() ?? '';

  if (!doc) {
    return '';
  }

  return tipo ? `${tipo} ${doc}` : doc;
}

const MARGIN = 20;
const BOTTOM_MARGIN = 34;
const FOOTER_HEIGHT = 28;
const HEADER_TITLE = 'CERTIFICADO MORA – OFICINA VIRTUAL';
const HEADER_CODE = 'AS-FR-054';

interface CertificadoMoraLayout {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  maxWidth: number;
  margin: number;
}

function drawPageFooter(layout: CertificadoMoraLayout): void {
  const { doc, pageHeight } = layout;
  const footerY = pageHeight - FOOTER_HEIGHT;
  addFooterContact(doc, footerY);
}

function drawTableHeaders(
  layout: CertificadoMoraLayout,
  assets: Awaited<ReturnType<typeof loadPdfAssets>>,
  y: number,
  razonSocial: string,
  tableCols: number[],
): number {
  const { doc, maxWidth, margin } = layout;

  // Fila APORTANTE
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, maxWidth, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`APORTANTE: ${razonSocial}`, margin + 2, y + 5.5);
  y += 8;

  // Encabezados de columnas
  const headers = ['Año', 'Mes', 'Documento', 'Cotizante'];
  let x = margin;
  for (let i = 0; i < headers.length; i++) {
    doc.rect(x, y, tableCols[i], 8);
    doc.text(headers[i], x + tableCols[i] / 2, y + 5.5, {
      align: 'center',
    });
    x += tableCols[i];
  }
  y += 8;

  return y;
}

function ensureSpace(
  layout: CertificadoMoraLayout,
  assets: Awaited<ReturnType<typeof loadPdfAssets>>,
  y: number,
  neededSpace: number,
  razonSocial: string,
  tableCols: number[],
  redrawTableHeaders: boolean,
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
  newY += 14;

  if (redrawTableHeaders) {
    newY = drawTableHeaders(layout, assets, newY, razonSocial, tableCols);
  }

  return newY;
}

export async function generateCertificadoMoraPdf(
  registros: MoraAportanteRegistro[],
  identificacion: string,
  razonSocial: string,
): Promise<void> {
  const assets = await loadPdfAssets(false);
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = 0;

  const layout: CertificadoMoraLayout = {
    doc,
    pageWidth,
    pageHeight,
    maxWidth,
    margin: MARGIN,
  };

  y = drawHeader(doc, assets, {
    titulo: HEADER_TITLE,
    codigo: HEADER_CODE,
    mostrarLogoSupersalud: false,
  });
  drawPageFooter(layout);
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

  const nombreCoordinador = getNombreCoordinadorMovilidad();

  const paragraph1 =
    'Que una vez revisado en el Sistema de Información Contable y Financiero de MALLAMAS EPS-I, se encontró que el aportante ' +
    razonSocial +
    ', con número de Identificación ' +
    identificacion +
    ' tiene morosidad por concepto de pago a Seguridad Social en Salud del Régimen Contributivo correspondiente a los periodos descritos a continuación:';

  const detalle = registros.map((registro) => ({
    anio: String(registro.anio ?? ''),
    mes: String(registro.numMes ?? ''),
    documento: buildDocumentoCotizante(
      registro.tipoDocCotizante,
      registro.documento,
    ),
    cotizante: buildNombreCompletoCotizante(registro),
  }));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const lines1 = doc.splitTextToSize(paragraph1, maxWidth);
  doc.text(lines1, MARGIN, y, { align: 'justify', maxWidth });
  y += lines1.length * 4.5 + 6;

  const tableCols = [30, 30, 35, maxWidth - 95];

  y = ensureSpace(layout, assets, y, 16, razonSocial, tableCols, false);
  y = drawTableHeaders(layout, assets, y, razonSocial, tableCols);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  for (const row of detalle) {
    const rowTexts = [row.anio, row.mes, row.documento, row.cotizante];
    const rowHeight = 7;

    y = ensureSpace(
      layout,
      assets,
      y,
      rowHeight,
      razonSocial,
      tableCols,
      true,
    );

    let x = MARGIN;
    for (let i = 0; i < rowTexts.length; i++) {
      doc.rect(x, y, tableCols[i], rowHeight);
      let textX = x + 1.5;
      let align: 'left' | 'center' = 'left';
      if (i < 2) {
        textX = x + tableCols[i] / 2;
        align = 'center';
      }
      doc.text(String(rowTexts[i] ?? ''), textX, y + 4.5, { align });
      x += tableCols[i];
    }
    y += rowHeight;
  }

  y += 8;

  const paragraph2 =
    'Cabe aclarar que el valor a pagar puede variar de acuerdo con la fecha en que el aportante realice el pago debido a que la liquidación la realiza el operador de pila y el interés de mora se calcula por los días vencidos. Si presenta objeción de acuerdo con la información anterior, por favor comunicarse a los celulares 3187169485 – 3175869101, o al correo electrónico soportecartera@mallamaseps.com, donde recibirá más información.';

  doc.setFontSize(10);
  const lines2 = doc.splitTextToSize(paragraph2, maxWidth);

  const expDate = formatFechaCertificadoEspanol(new Date());
  const paragraph3 = `La presente se expide a petición del interesado a los ${expDate.dia} días del mes de ${expDate.mes} del ${expDate.anio}.`;
  const lines3 = doc.splitTextToSize(paragraph3, maxWidth);

  const paragraphsHeight =
    lines2.length * 4.5 + 6 + lines3.length * 4.5 + 12 + 18;

  y = ensureSpace(
    layout,
    assets,
    y,
    paragraphsHeight,
    razonSocial,
    tableCols,
    false,
  );

  doc.text(lines2, MARGIN, y, { align: 'justify', maxWidth });
  y += lines2.length * 4.5 + 6;

  doc.text(lines3, MARGIN, y, { align: 'justify', maxWidth });
  y += lines3.length * 4.5 + 12;

  // Firma después de la tabla
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(nombreCoordinador, pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Coordinador de Movilidad', pageWidth / 2, y + 5, {
    align: 'center',
  });
  doc.text('MALLAMAS EPS-I', pageWidth / 2, y + 10, { align: 'center' });
  y += 18;

  // Footer después de firma y tabla
  const notasHeight = 60;
  y = ensureSpace(
    layout,
    assets,
    y,
    notasHeight,
    razonSocial,
    tableCols,
    false,
  );

  y = addFooterNotes(doc, y);

  const safeId = identificacion.replace(/[^\dA-Za-z-]/g, '_') || 'aportante';
  doc.save(`certificado_mora_${safeId}.pdf`);
}