import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {
  ActualizacionAportanteStatus,
  EstadoActualizacionAportante,
} from '../interfaces/actualizacion-aportante-status.interface';
import { UltimaActualizacionResponse, ValidationMessageConfig } from '../interfaces/ultima-actualizacion.interface';

const MESES_LIMITE_ACTUALIZACION = 6;

@Injectable({
  providedIn: 'root',
})
export class AportanteValidationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  validationResult = signal<ValidationMessageConfig | null>(null);
  isValidating = signal<boolean>(false);

  applyEstadoActualizacion(estado: ActualizacionAportanteStatus | null): ValidationMessageConfig | null {
    if (!estado) {
      this.validationResult.set(null);
      return null;
    }

    const validationConfig = this.createValidationMessageFromEstado(estado);
    this.validationResult.set(validationConfig);
    return validationConfig;
  }

  async resolveEstadoActualizacion(
    aportanteId?: number | null,
  ): Promise<ActualizacionAportanteStatus | null> {
    if (!aportanteId) {
      return this.buildEstado('SIN_APORTANTE', null);
    }

    this.isValidating.set(true);

    try {
      const url = `${this.baseUrl}/ultimaActualizacion/${aportanteId}`;
      const response = await firstValueFrom(
        this.http.get<UltimaActualizacionResponse>(url),
      );

      const meses = response.mesesDesdeUltimaActualizacion ?? 0;
      const estado: EstadoActualizacionAportante =
        meses >= MESES_LIMITE_ACTUALIZACION ? 'MAYOR_6_MESES' : 'MENOR_6_MESES';

      return {
        tieneAportante: true,
        tieneUltimaActualizacion: true,
        aportanteId,
        estado,
        mesesDesdeUltimaActualizacion: meses,
        fechaUltimaActualizacion: response.fechaUltimaActualizacion,
        nombreRazonSocial: response.nombreRazonSocial,
        idenAportante: response.idenAportante,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        return this.buildEstado('SIN_ULTIMA_ACTUALIZACION', aportanteId);
      }

      console.error('Error al consultar última actualización:', error);
      return null;
    } finally {
      this.isValidating.set(false);
    }
  }

  private buildEstado(
    estado: EstadoActualizacionAportante,
    aportanteId: number | null,
  ): ActualizacionAportanteStatus {
    const tieneAportante = estado !== 'SIN_APORTANTE';

    return {
      tieneAportante,
      tieneUltimaActualizacion:
        estado === 'MENOR_6_MESES' || estado === 'MAYOR_6_MESES',
      aportanteId,
      estado,
      mesesDesdeUltimaActualizacion: null,
      fechaUltimaActualizacion: null,
      nombreRazonSocial: null,
      idenAportante: null,
    };
  }

  private createValidationMessageFromEstado(
    estado: ActualizacionAportanteStatus,
  ): ValidationMessageConfig {
    switch (estado.estado) {
      case 'SIN_APORTANTE':
        return {
          title: 'Aportante No Asociado',
          message:
            'Su usuario no tiene un aportante asociado. Debe crear el registro del aportante para continuar.',
          buttonText: 'Crear Aportante',
          buttonAction: 'create-aportante',
          showButton: true,
          colorScheme: 'register',
        };

      case 'SIN_ULTIMA_ACTUALIZACION':
        return {
          title: 'Última Actualización No Registrada',
          message: 'No tiene última actualización registrada. Debe actualizar sus datos.',
          buttonText: 'Actualizar Datos',
          buttonAction: 'update-ultima-actualizacion',
          showButton: true,
          colorScheme: 'update',
        };

      case 'MAYOR_6_MESES':
        return {
          title: 'Actualización de Datos Requerida',
          message:
            'Usted debe actualizar sus datos. Han transcurrido 6 meses o más desde su última actualización.',
          buttonText: 'Actualizar Datos',
          buttonAction: 'update',
          showButton: true,
          colorScheme: 'update',
        };

      case 'MENOR_6_MESES':
      default:
        return {
          title: '',
          message: '',
          buttonText: '',
          buttonAction: 'update',
          showButton: false,
          colorScheme: 'update',
        };
    }
  }

  clearValidationResult(): void {
    this.validationResult.set(null);
  }
}
