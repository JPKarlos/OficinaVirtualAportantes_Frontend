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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return '';
  }

  return parts.pop()?.toUpperCase() ?? '';
}

export function isFormatAllowed(
  fileName: string,
  formatosPermitidos: string[],
): boolean {
  const extension = getFileExtension(fileName);
  if (!extension) {
    return false;
  }

  return formatosPermitidos.some(
    (formato) => formato.toUpperCase() === extension,
  );
}
