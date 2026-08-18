import { jsPDF } from 'jspdf';

export interface FechaCertificadoEspanol {
  dia: string;
  mes: string;
  anio: string;
  diaEnLetras: string;
}

const MESES = [
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
] as const;

const DIAS_EN_LETRAS: Record<number, string> = {
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
  30: 'treinta',
  31: 'treinta y uno',
};

const ASSET_BASE_URL = 'assets/images';

async function loadImageAsDataUrl(imageName: string): Promise<string> {
  const response = await fetch(`${ASSET_BASE_URL}/${imageName}`);
  if (!response.ok) {
    throw new Error(`No fue posible cargar la imagen ${imageName}.`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error(`No fue posible leer la imagen ${imageName}.`));
    reader.readAsDataURL(blob);
  });
}

export function formatFechaCertificadoEspanol(
  date: Date,
): FechaCertificadoEspanol {
  const day = date.getDate();
  const monthIndex = date.getMonth();

  return {
    dia: String(day),
    mes: MESES[monthIndex] ?? '',
    anio: String(date.getFullYear()),
    diaEnLetras: DIAS_EN_LETRAS[day] ?? String(day),
  };
}

export function getNombreCoordinadorMovilidad(): string {
  return 'ANDRES PAGUAY';
}

export interface HeaderOptions {
  titulo: string;
  codigo: string;
  mostrarLogoSupersalud?: boolean;
}

export interface PdfAssets {
  logoMallamas: string;
  documentoControlado: string;
  logoSupersalud: string;
}

export async function loadPdfAssets(
  includeLogoSupersalud = true,
): Promise<PdfAssets> {
  const [logoMallamas, documentoControlado] = await Promise.all([
    loadImageAsDataUrl('logo-mallamas.png'),
    loadImageAsDataUrl('documento-controlado.png'),
  ]);

  const logoSupersalud = includeLogoSupersalud
    ? await loadImageAsDataUrl('logo-supersalud.png')
    : '';

  return { logoMallamas, documentoControlado, logoSupersalud };
}

export function drawHeader(
  doc: jsPDF,
  assets: PdfAssets,
  options: HeaderOptions,
): number {
  const { mostrarLogoSupersalud = false } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const tableWidth = pageWidth - margin * 2;
  const rowHeight = 16;
  const colWidths = [37, tableWidth - 37 - 17 - 32, 17, 32];

  const startY = 12;

  // Celda 1: Logo Mallamas
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(margin, startY, colWidths[0], rowHeight);
  const logoH = 9;
  const logoW = (336 / 116) * logoH;
  doc.addImage(
    assets.logoMallamas,
    'PNG',
    margin + (colWidths[0] - logoW) / 2,
    startY + (rowHeight - logoH) / 2,
    logoW,
    logoH,
  );

  // Celda 2: Título
  const x2 = margin + colWidths[0];
  doc.rect(x2, startY, colWidths[1], rowHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const tituloLines = options.titulo.split('\n');
  const lineHeight = 3.5;
  const totalTituloHeight = tituloLines.length * lineHeight;
  let tituloY = startY + (rowHeight - totalTituloHeight) / 2 + 3;
  for (const line of tituloLines) {
    doc.text(line, x2 + colWidths[1] / 2, tituloY, { align: 'center' });
    tituloY += lineHeight;
  }

  // Celda 3: Documento controlado
  const x3 = x2 + colWidths[1];
  doc.rect(x3, startY, colWidths[2], rowHeight);
  const stampH = 8;
  const stampW = (145 / 126) * stampH;
  doc.addImage(
    assets.documentoControlado,
    'PNG',
    x3 + (colWidths[2] - stampW) / 2,
    startY + (rowHeight - stampH) / 2,
    stampW,
    stampH,
  );

  // Celda 4: Metadatos
  const x4 = x3 + colWidths[2];
  doc.rect(x4, startY, colWidths[3], rowHeight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Código: ${options.codigo}`, x4 + 1.5, startY + 5);
  doc.text('Versión: 01', x4 + 1.5, startY + 9);
  doc.text('Vigencia: 05/08/2026', x4 + 1.5, startY + 13);

  const headerBottom = startY + rowHeight;

  // Logo Supersalud como marca de agua vertical (derecha), rotado 90°
  if (mostrarLogoSupersalud) {
    const supersaludH = 12;
    const supersaludW = (386 / 131) * supersaludH;

    doc.addImage(
      assets.logoSupersalud,
      'PNG',
      margin + tableWidth - supersaludH - 2,
      headerBottom + 4,
      supersaludH,
      supersaludW,
      undefined,
      'FAST',
      90,
    );
  }

  return headerBottom;
}

export function addFooterContact(doc: jsPDF, y: number): number {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Línea separadora
  doc.setDrawColor(0, 120, 60);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    'Carrera 1 norte 4 - 56 Avenida Panamericana Ipiales (Nariño)',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Contactos: 3175869101 – 3187169485     E-Mail: soportecartera@mallamaseps.com',
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  y += 4;

  doc.text(
    'Página Web: www.mallamaseps.com     NIT: 837.000.084-5     Línea gratuita: 018000 913 701',
    pageWidth / 2,
    y,
    { align: 'center' },
  );

  doc.setTextColor(0, 0, 0);
  return y + 6;
}

export function addFooterNotes(doc: jsPDF, y: number): number {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  const notas = [
    'Nota 1: El presente certificado fue descargado desde la oficina virtual de aportantes.',
    'Nota 2: Si el aportante mantiene alguna obligación contractual con uno o más trabajadores y dicha vinculación aún no ha sido reportada a Mallamas EPS-I, esta certificación no lo exime del cumplimiento de la obligación de realizar los aportes correspondientes. En consecuencia, los aportes y/o la mora derivados de dicha obligación no se verán reflejados en el presente certificado.',
  ];

  for (const nota of notas) {
    const lines = doc.splitTextToSize(nota, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.5 + 2.5;
  }

  doc.setTextColor(0, 0, 0);
  return y;
}

export function formatFechaEspanol(fecha: FechaCertificadoEspanol): string {
  return `${fecha.dia} del mes de ${fecha.mes} del ${fecha.anio}`;
}