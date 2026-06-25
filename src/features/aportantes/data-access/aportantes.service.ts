import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {
  CreateAportanteRequest,
  CreateAportanteResponse,
  UpdateAportanteRequest,
  UpdateAportanteResponse,
} from '../interfaces/create-aportante.interface';
import { AportanteDetail } from '../interfaces/aportante-detail.interface';

@Injectable({
  providedIn: 'root',
})
export class AportantesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async create(payload: CreateAportanteRequest): Promise<CreateAportanteResponse> {
    return firstValueFrom(
      this.http.post<CreateAportanteResponse>(`${this.baseUrl}/aportantes`, payload),
    );
  }

  async getById(aportanteId: number): Promise<AportanteDetail> {
    return firstValueFrom(
      this.http.get<AportanteDetail>(`${this.baseUrl}/aportantes/${aportanteId}`),
    );
  }

  async update(
    aportanteId: number,
    payload: UpdateAportanteRequest,
  ): Promise<UpdateAportanteResponse> {
    return firstValueFrom(
      this.http.put<UpdateAportanteResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}`,
        payload,
      ),
    );
  }
}
