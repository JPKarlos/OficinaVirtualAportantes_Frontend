import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { IncapacidadesAportanteResponse } from '../interfaces/incapacidad-aportante.interface';

@Injectable({
  providedIn: 'root',
})
export class IncapacidadesAportanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listByAportanteId(
    aportanteId: number,
  ): Promise<IncapacidadesAportanteResponse> {
    return firstValueFrom(
      this.http.get<IncapacidadesAportanteResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/incapacidades`,
      ),
    );
  }
}
