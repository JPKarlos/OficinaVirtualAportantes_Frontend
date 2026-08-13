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

  async downloadSoportePago(
    aportanteId: number,
    afiliadoId: number,
    licenciasMaternidadId: number,
  ): Promise<{ blob: Blob; fileName: string }> {
    const response = await firstValueFrom(
      this.http.get(
        `${this.baseUrl}/aportantes/${aportanteId}/afiliados/${afiliadoId}/licencias/${licenciasMaternidadId}/soporte-pago`,
        {
          responseType: 'blob',
          observe: 'response',
        },
      ),
    );

    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const fileName = match?.[1] ?? 'soporte-pago';

    return {
      blob: response.body as Blob,
      fileName,
    };
  }
}
