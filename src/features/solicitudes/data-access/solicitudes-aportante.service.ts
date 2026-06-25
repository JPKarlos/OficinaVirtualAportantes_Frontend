import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {
  CreateSolicitudResponse,
  SolicitudesAportanteResponse,
} from '../interfaces/solicitud-novedad.interface';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesAportanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listByAportanteId(
    aportanteId: number,
  ): Promise<SolicitudesAportanteResponse> {
    return firstValueFrom(
      this.http.get<SolicitudesAportanteResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/solicitudes`,
      ),
    );
  }

  async create(
    aportanteId: number,
    formData: FormData,
  ): Promise<CreateSolicitudResponse> {
    return firstValueFrom(
      this.http.post<CreateSolicitudResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/solicitudes`,
        formData,
      ),
    );
  }
}
