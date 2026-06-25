import { Component, inject, signal } from '@angular/core';
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
import { CreateAportanteRequest } from '../interfaces/create-aportante.interface';

@Component({
  selector: 'app-create-aportante',
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
  templateUrl: './create-aportante.component.html',
})
export default class CreateAportanteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly aportantesService = inject(AportantesService);
  private readonly authService = inject(AuthService);

  createForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor() {
    this.createForm = this.fb.group({
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
      email: ['', [Validators.email, Validators.maxLength(60)]],
      email2: ['', [Validators.email, Validators.maxLength(60)]],
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

  get apidentificacionId(): AbstractControl | null {
    return this.createForm.get('apidentificacionId');
  }

  get idenAportante(): AbstractControl | null {
    return this.createForm.get('idenAportante');
  }

  get nombreRazonSocial(): AbstractControl | null {
    return this.createForm.get('nombreRazonSocial');
  }

  get municipioIde(): AbstractControl | null {
    return this.createForm.get('municipioIde');
  }

  get ciiuClaseId(): AbstractControl | null {
    return this.createForm.get('ciiuClaseId');
  }

  get claseAportanteIde(): AbstractControl | null {
    return this.createForm.get('claseAportanteIde');
  }

  get naturalezaAportanteIde(): AbstractControl | null {
    return this.createForm.get('naturalezaAportanteIde');
  }

  get tipoPersonaIde(): AbstractControl | null {
    return this.createForm.get('tipoPersonaIde');
  }

  get rlIdentificacionId(): AbstractControl | null {
    return this.createForm.get('rlIdentificacionId');
  }

  get email(): AbstractControl | null {
    return this.createForm.get('email');
  }

  get email2(): AbstractControl | null {
    return this.createForm.get('email2');
  }

  async onSubmit(): Promise<void> {
    if (!this.createForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const response = await this.aportantesService.create(
        this.buildCreatePayload(),
      );

      this.authService.updateSessionAfterAportanteCreated(
        response.aportanteId,
        response.estadoActualizacion,
      );

      this.successMessage.set(
        'Aportante registrado correctamente. Será redirigido al inicio.',
      );
      this.createForm.markAsPristine();

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible registrar el aportante. Intente nuevamente.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

  private buildCreatePayload(): CreateAportanteRequest {
    const raw = this.createForm.getRawValue();

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

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach((key) => {
      this.createForm.get(key)?.markAsTouched();
    });
  }
}
