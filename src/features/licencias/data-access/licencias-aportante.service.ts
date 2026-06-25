import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { LicenciasAportanteResponse } from '../interfaces/licencia-aportante.interface';

@Injectable({
  providedIn: 'root',
})
export class LicenciasAportanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listByAportanteId(
    aportanteId: number,
  ): Promise<LicenciasAportanteResponse> {
    return firstValueFrom(
      this.http.get<LicenciasAportanteResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/licencias`,
      ),
    );
  }
}
