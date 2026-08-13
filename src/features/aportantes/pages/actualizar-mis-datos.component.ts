import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import LayoutComponent from '../../../shared/ui/layout.component';
import { MunicipioSelectComponent } from '../components/municipio-select.component';
import { CiiuClaseSelectComponent } from '../components/ciiu-clase-select.component';
import { TipoIdenContSelectComponent } from '../components/tipo-iden-cont-select.component';
import { ClaseAportanteSelectComponent } from '../components/clase-aportante-select.component';
import { NaturalezaAportanteSelectComponent } from '../components/naturaleza-aportante-select.component';
import { TipoPersonaSelectComponent } from '../components/tipo-persona-select.component';
import { TipoAccionSelectComponent } from '../components/tipo-accion-select.component';
import { TipoAportanteContSelectComponent } from '../components/tipo-aportante-cont-select.component';
import { FormaPresentacionSelectComponent } from '../components/forma-presentacion-select.component';
import { AportantesService } from '../data-access/aportantes.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { AportanteDetail } from '../interfaces/aportante-detail.interface';
import {
  buildInvalidFieldMessage,
  optionalEmailValidator,
  sanitizeEmailForForm,
} from '../utils/aportante-form.validators';

@Component({
  selector: 'app-actualizar-mis-datos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LayoutComponent,
    MunicipioSelectComponent,
    CiiuClaseSelectComponent,
    TipoIdenContSelectComponent,
    ClaseAportanteSelectComponent,
    NaturalezaAportanteSelectComponent,
    TipoPersonaSelectComponent,
    TipoAccionSelectComponent,
    TipoAportanteContSelectComponent,
    FormaPresentacionSelectComponent,
  ],
  templateUrl: './actualizar-mis-datos.component.html',
})
export default class ActualizarMisDatosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly aportantesService = inject(AportantesService);
  private readonly authService = inject(AuthService);

  updateForm: FormGroup;
  isLoading = signal(false);
  isLoadingData = signal(true);
  successMessage = signal('');
  errorMessage = signal('');
  aportanteId = signal<number | null>(null);
  rutFiles = signal<File[]>([]);
  rutError = signal('');
  isRutDragging = signal(false);
  readonly maxRutFileSize = 10 * 1024 * 1024;
  readonly maxRutFiles = 10;

  constructor() {
    this.updateForm = this.fb.group({
       apidentificacionId: [{ value: null, disabled: true }, [Validators.required]],
       idenAportante: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(16)]],
       dvAportante: [{ value: '', disabled: true }, [Validators.maxLength(1)]],
      nombreRazonSocial: ['', [Validators.required, Validators.maxLength(200)]],
      codSucDep: ['', [Validators.maxLength(10)]],
      nomSucDep: ['', [Validators.maxLength(40)]],
      claseAportanteIde: [null, [Validators.required]],
      tipoAportanteContIde: [null],
      naturalezaAportanteIde: [null, [Validators.required]],
      tipoPersonaIde: [null, [Validators.required]],
      formaPresentacionIde: [null],
      tipoAccionIde: [null],
      municipioIde: [null, [Validators.required]],
      ciiuClaseId: [null, [Validators.required]],
      direccionCorres: ['', [Validators.maxLength(40)]],
      direccionAlterna: ['', [Validators.maxLength(50)]],
      telefono: ['', [Validators.maxLength(13)]],
      telefono2: ['', [Validators.maxLength(13)]],
      celular: ['', [Validators.maxLength(13)]],
      celular2: ['', [Validators.maxLength(13)]],
      fax: ['', [Validators.maxLength(13)]],
      email: ['', [optionalEmailValidator, Validators.maxLength(60)]],
      email2: ['', [optionalEmailValidator, Validators.maxLength(60)]],
      rlIdentificacionId: [null, [Validators.required]],
      idenRepLegal: ['', [Validators.maxLength(16)]],
      dvRepLegal: ['', [Validators.maxLength(1)]],
      apellido1RepLeg: ['', [Validators.maxLength(20)]],
      apellido2RepLeg: ['', [Validators.maxLength(30)]],
      nombre1RepLeg: ['', [Validators.maxLength(20)]],
      nombre2RepLeg: ['', [Validators.maxLength(30)]],
      fechaInicio: [''],
      fechaFin: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    const aportanteId =
      this.authService.getUser()?.Aportante_id ??
      this.authService.getEstadoActualizacion()?.aportanteId ??
      null;

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado a su usuario.');
      this.isLoadingData.set(false);
      return;
    }

    this.aportanteId.set(aportanteId);

    try {
      const aportante = await this.aportantesService.getById(aportanteId);
      this.patchFormFromAportante(aportante);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible cargar los datos del aportante.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isLoadingData.set(false);
    }
  }

  get apidentificacionId(): AbstractControl | null {
    return this.updateForm.get('apidentificacionId');
  }

  get idenAportante(): AbstractControl | null {
    return this.updateForm.get('idenAportante');
  }

  get nombreRazonSocial(): AbstractControl | null {
    return this.updateForm.get('nombreRazonSocial');
  }

  get municipioIde(): AbstractControl | null {
    return this.updateForm.get('municipioIde');
  }

  get ciiuClaseId(): AbstractControl | null {
    return this.updateForm.get('ciiuClaseId');
  }

  get claseAportanteIde(): AbstractControl | null {
    return this.updateForm.get('claseAportanteIde');
  }

  get naturalezaAportanteIde(): AbstractControl | null {
    return this.updateForm.get('naturalezaAportanteIde');
  }

  get tipoPersonaIde(): AbstractControl | null {
    return this.updateForm.get('tipoPersonaIde');
  }

  get rlIdentificacionId(): AbstractControl | null {
    return this.updateForm.get('rlIdentificacionId');
  }

  get email(): AbstractControl | null {
    return this.updateForm.get('email');
  }

  get email2(): AbstractControl | null {
    return this.updateForm.get('email2');
  }

  async onSubmit(): Promise<void> {
    if (this.rutFiles().length === 0) {
      this.rutError.set('Debe cargar al menos un documento de soporte en formato PDF.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!this.updateForm.valid) {
      this.markFormGroupTouched();
      this.successMessage.set('');
      this.errorMessage.set(buildInvalidFieldMessage(this.updateForm.controls));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const aportanteId = this.aportanteId();
    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado a su usuario.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData = this.buildUpdateFormData();

      const response = await this.aportantesService.updateMisDatos(
        aportanteId,
        formData,
      );

      this.authService.updateSessionAfterAportanteCreated(
        response.aportanteId,
        response.estadoActualizacion,
      );

      this.successMessage.set(
        'Datos actualizados correctamente. Será redirigido al inicio.',
      );
      this.updateForm.markAsPristine();

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } catch (error: unknown) {
      this.errorMessage.set(this.resolveSubmitErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

  onRutFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.processRutFiles(files);
    input.value = '';
  }

  onRutDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isRutDragging.set(true);
  }

  onRutDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isRutDragging.set(false);
  }

  onRutDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isRutDragging.set(false);
    const files = event.dataTransfer?.files
      ? Array.from(event.dataTransfer.files)
      : [];
    this.processRutFiles(files);
  }

  removeRutFile(file: File): void {
    this.rutFiles.update((current) => current.filter((f) => f !== file));
    this.rutError.set('');
  }

  private processRutFiles(files: File[]): void {
    if (!files.length) {
      return;
    }

    const current = this.rutFiles();

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        this.rutError.set(
          'Todos los documentos de soporte deben estar en formato PDF.',
        );
        continue;
      }

      if (file.size > this.maxRutFileSize) {
        this.rutError.set(
          'Un documento supera el tamaño máximo permitido (10 MB por archivo).',
        );
        continue;
      }
    }

    const validFiles = files.filter(
      (file) =>
        file.name.toLowerCase().endsWith('.pdf') &&
        file.size <= this.maxRutFileSize &&
        !current.some((f) => f.name === file.name && f.size === file.size),
    );

    if (!validFiles.length) {
      this.rutError.set(
        this.rutError() ||
          'No se pudo cargar ningún archivo válido. Verifique los formatos.',
      );
      return;
    }

    if (current.length + validFiles.length > this.maxRutFiles) {
      this.rutError.set(
        `Solo se permiten hasta ${this.maxRutFiles} documentos de soporte.`,
      );
      this.rutFiles.set([...current, ...validFiles].slice(0, this.maxRutFiles));
      return;
    }

    this.rutError.set('');
    this.rutFiles.set([...current, ...validFiles]);
  }

  private patchFormFromAportante(aportante: AportanteDetail): void {
    this.updateForm.patchValue({
      apidentificacionId: this.toNumberOrNull(aportante.apidentificacionId),
      idenAportante: aportante.idenAportante ?? '',
      dvAportante: aportante.dvAportante ?? '',
      nombreRazonSocial: aportante.nombreRazonSocial ?? '',
      codSucDep: aportante.codSucDep ?? '',
      nomSucDep: aportante.nomSucDep ?? '',
      claseAportanteIde: this.toNumberOrNull(aportante.claseAportanteIde),
      tipoAportanteContIde: this.toNumberOrNull(aportante.tipoAportanteContIde),
      naturalezaAportanteIde: this.toNumberOrNull(aportante.naturalezaAportanteIde),
      tipoPersonaIde: this.toNumberOrNull(aportante.tipoPersonaIde),
      formaPresentacionIde: this.toNumberOrNull(aportante.formaPresentacionIde),
      tipoAccionIde: this.toNumberOrNull(aportante.tipoAccionIde),
      municipioIde: this.toNumberOrNull(aportante.municipioIde),
      ciiuClaseId: this.toNumberOrNull(aportante.ciiuClaseId),
      direccionCorres: aportante.direccionCorres ?? '',
      direccionAlterna: aportante.direccionAlterna ?? '',
      telefono: aportante.telefono ?? '',
      telefono2: aportante.telefono2 ?? '',
      celular: aportante.celular ?? '',
      celular2: aportante.celular2 ?? '',
      fax: aportante.fax ?? '',
      email: sanitizeEmailForForm(aportante.email),
      email2: sanitizeEmailForForm(aportante.email2),
      idenRepLegal: aportante.idenRepLegal ?? '',
      dvRepLegal: aportante.dvRepLegal ?? '',
      rlIdentificacionId: this.toNumberOrNull(aportante.rlIdentificacionId),
      apellido1RepLeg: aportante.apellido1RepLeg ?? '',
      apellido2RepLeg: aportante.apellido2RepLeg ?? '',
      nombre1RepLeg: aportante.nombre1RepLeg ?? '',
      nombre2RepLeg: aportante.nombre2RepLeg ?? '',
      fechaInicio: this.formatDateForInput(aportante.fechaInicio),
      fechaFin: this.formatDateForInput(aportante.fechaFin),
    });
  }

  private formatDateForInput(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private buildUpdateFormData(): FormData {
    const raw = this.updateForm.getRawValue();
    const formData = new FormData();

    formData.append('nombreRazonSocial', raw.nombreRazonSocial ?? '');
    if (raw.apidentificacionId !== null && raw.apidentificacionId !== undefined) {
      formData.append('apidentificacionId', String(raw.apidentificacionId));
    }
    formData.append('idenAportante', raw.idenAportante ?? '');
    if (raw.dvAportante) {
      formData.append('dvAportante', raw.dvAportante);
    }
    if (raw.codSucDep) {
      formData.append('codSucDep', raw.codSucDep);
    }
    if (raw.nomSucDep) {
      formData.append('nomSucDep', raw.nomSucDep);
    }
    if (raw.claseAportanteIde !== null && raw.claseAportanteIde !== undefined) {
      formData.append('claseAportanteIde', String(raw.claseAportanteIde));
    }
    if (raw.tipoAportanteContIde !== null && raw.tipoAportanteContIde !== undefined) {
      formData.append('tipoAportanteContIde', String(raw.tipoAportanteContIde));
    }
    if (raw.naturalezaAportanteIde !== null && raw.naturalezaAportanteIde !== undefined) {
      formData.append('naturalezaAportanteIde', String(raw.naturalezaAportanteIde));
    }
    if (raw.tipoPersonaIde !== null && raw.tipoPersonaIde !== undefined) {
      formData.append('tipoPersonaIde', String(raw.tipoPersonaIde));
    }
    if (raw.formaPresentacionIde !== null && raw.formaPresentacionIde !== undefined) {
      formData.append('formaPresentacionIde', String(raw.formaPresentacionIde));
    }
    if (raw.tipoAccionIde !== null && raw.tipoAccionIde !== undefined) {
      formData.append('tipoAccionIde', String(raw.tipoAccionIde));
    }
    if (raw.municipioIde !== null && raw.municipioIde !== undefined) {
      formData.append('municipioIde', String(raw.municipioIde));
    }
    if (raw.ciiuClaseId !== null && raw.ciiuClaseId !== undefined) {
      formData.append('ciiuClaseId', String(raw.ciiuClaseId));
    }
    if (raw.direccionCorres) {
      formData.append('direccionCorres', raw.direccionCorres);
    }
    if (raw.direccionAlterna) {
      formData.append('direccionAlterna', raw.direccionAlterna);
    }
    if (raw.telefono) {
      formData.append('telefono', raw.telefono);
    }
    if (raw.telefono2) {
      formData.append('telefono2', raw.telefono2);
    }
    if (raw.celular) {
      formData.append('celular', raw.celular);
    }
    if (raw.celular2) {
      formData.append('celular2', raw.celular2);
    }
    if (raw.fax) {
      formData.append('fax', raw.fax);
    }
    if (raw.email) {
      formData.append('email', raw.email);
    }
    if (raw.email2) {
      formData.append('email2', raw.email2);
    }
    if (raw.rlIdentificacionId !== null && raw.rlIdentificacionId !== undefined) {
      formData.append('rlIdentificacionId', String(raw.rlIdentificacionId));
    }
    if (raw.idenRepLegal) {
      formData.append('idenRepLegal', raw.idenRepLegal);
    }
    if (raw.dvRepLegal) {
      formData.append('dvRepLegal', raw.dvRepLegal);
    }
    if (raw.apellido1RepLeg) {
      formData.append('apellido1RepLeg', raw.apellido1RepLeg);
    }
    if (raw.apellido2RepLeg) {
      formData.append('apellido2RepLeg', raw.apellido2RepLeg);
    }
    if (raw.nombre1RepLeg) {
      formData.append('nombre1RepLeg', raw.nombre1RepLeg);
    }
    if (raw.nombre2RepLeg) {
      formData.append('nombre2RepLeg', raw.nombre2RepLeg);
    }
    if (raw.fechaInicio) {
      formData.append('fechaInicio', raw.fechaInicio);
    }
    if (raw.fechaFin) {
      formData.append('fechaFin', raw.fechaFin);
    }

    for (const file of this.rutFiles()) {
      formData.append('files', file, file.name);
    }

    return formData;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.updateForm.controls).forEach((key) => {
      this.updateForm.get(key)?.markAsTouched();
    });
  }

  private resolveSubmitErrorMessage(error: unknown): string {
    const httpError = error as {
      error?: { message?: string | string[] };
      message?: string;
      status?: number;
    };

    const apiMessage = httpError.error?.message ?? httpError.message;

    if (Array.isArray(apiMessage)) {
      return apiMessage.join(', ');
    }

    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }

    if (httpError.status === 0) {
      return 'No hay conexión con el servidor. Verifique que la API esté en ejecución.';
    }

    return 'No fue posible procesar la actualización. Intente nuevamente.';
  }
}
