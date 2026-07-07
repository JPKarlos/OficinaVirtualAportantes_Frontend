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
import { CreateAportanteRequest } from '../interfaces/create-aportante.interface';
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

  constructor() {
    this.updateForm = this.fb.group({
      apidentificacionId: [null, [Validators.required]],
      idenAportante: ['', [Validators.required, Validators.maxLength(16)]],
      dvAportante: ['', [Validators.maxLength(1)]],
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
      const response = await this.aportantesService.updateMisDatos(
        aportanteId,
        this.buildUpdatePayload(),
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

  private buildUpdatePayload(): CreateAportanteRequest {
    const raw = this.updateForm.getRawValue();

    return {
      nombreRazonSocial: raw.nombreRazonSocial,
      apidentificacionId: raw.apidentificacionId,
      idenAportante: raw.idenAportante,
      dvAportante: this.toNullableString(raw.dvAportante),
      codSucDep: this.toNullableString(raw.codSucDep),
      nomSucDep: this.toNullableString(raw.nomSucDep),
      claseAportanteIde: raw.claseAportanteIde,
      naturalezaAportanteIde: raw.naturalezaAportanteIde,
      tipoPersonaIde: raw.tipoPersonaIde,
      formaPresentacionIde: raw.formaPresentacionIde ?? null,
      direccionCorres: this.toNullableString(raw.direccionCorres),
      direccionAlterna: this.toNullableString(raw.direccionAlterna),
      municipioIde: raw.municipioIde,
      ciiuClaseId: raw.ciiuClaseId,
      telefono: this.toNullableString(raw.telefono),
      telefono2: this.toNullableString(raw.telefono2),
      celular: this.toNullableString(raw.celular),
      celular2: this.toNullableString(raw.celular2),
      fax: this.toNullableString(raw.fax),
      email: this.toNullableString(raw.email),
      email2: this.toNullableString(raw.email2),
      idenRepLegal: this.toNullableString(raw.idenRepLegal),
      dvRepLegal: this.toNullableString(raw.dvRepLegal),
      rlIdentificacionId: raw.rlIdentificacionId,
      apellido1RepLeg: this.toNullableString(raw.apellido1RepLeg),
      apellido2RepLeg: this.toNullableString(raw.apellido2RepLeg),
      nombre1RepLeg: this.toNullableString(raw.nombre1RepLeg),
      nombre2RepLeg: this.toNullableString(raw.nombre2RepLeg),
      fechaInicio: this.toNullableString(raw.fechaInicio),
      tipoAccionIde: raw.tipoAccionIde ?? null,
      fechaFin: this.toNullableString(raw.fechaFin),
      tipoAportanteContIde: raw.tipoAportanteContIde ?? null,
    };
  }

  private toNullableString(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
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
