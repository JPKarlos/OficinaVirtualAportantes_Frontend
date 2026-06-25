import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function optionalEmailValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value;
  const value = typeof raw === 'string' ? raw.trim() : raw;

  if (!value) {
    return null;
  }

  return Validators.email(control);
}

export function isValidEmailValue(value: string | null | undefined): boolean {
  if (!value?.trim()) {
    return true;
  }

  const control = { value: value.trim() } as AbstractControl;
  return Validators.email(control) === null;
}

export function sanitizeEmailForForm(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  const trimmed = value.trim();
  return isValidEmailValue(trimmed) ? trimmed : '';
}

const FIELD_LABELS: Record<string, string> = {
  apidentificacionId: 'Tipo de identificación del aportante',
  idenAportante: 'Identificación del aportante',
  nombreRazonSocial: 'Nombre o razón social',
  claseAportanteIde: 'Clase aportante',
  naturalezaAportanteIde: 'Naturaleza aportante',
  tipoPersonaIde: 'Tipo de persona',
  municipioIde: 'Municipio',
  ciiuClaseId: 'Actividad económica',
  rlIdentificacionId: 'Tipo documento representante legal',
  email: 'Correo electrónico',
  email2: 'Correo electrónico 2',
  dvAportante: 'Dígito de verificación',
  codSucDep: 'Código sucursal / dependencia',
  nomSucDep: 'Nombre sucursal / dependencia',
  direccionCorres: 'Dirección de correspondencia',
  direccionAlterna: 'Dirección alterna',
  telefono: 'Teléfono',
  telefono2: 'Teléfono 2',
  celular: 'Celular',
  celular2: 'Celular 2',
  fax: 'Fax',
};

export function buildInvalidFieldMessage(
  controls: Record<string, AbstractControl>,
): string {
  const invalidFields = Object.entries(controls)
    .filter(([, control]) => control.invalid)
    .map(([key]) => FIELD_LABELS[key] ?? key);

  if (invalidFields.length === 0) {
    return 'Revise los campos marcados en rojo antes de guardar.';
  }

  return `Revise los siguientes campos: ${invalidFields.join(', ')}.`;
}
