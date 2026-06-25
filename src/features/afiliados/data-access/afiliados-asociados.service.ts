import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AfiliadosAsociadosResponse } from '../interfaces/afiliado-asociado.interface';

@Injectable({
  providedIn: 'root',
})
export class AfiliadosAsociadosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listByAportanteId(aportanteId: number): Promise<AfiliadosAsociadosResponse> {
    return firstValueFrom(
      this.http.get<AfiliadosAsociadosResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/afiliados`,
      ),
    );
  }
}
