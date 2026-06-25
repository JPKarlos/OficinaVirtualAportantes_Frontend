import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { MoraAportanteResponse } from '../interfaces/mora-aportante.interface';

@Injectable({
  providedIn: 'root',
})
export class MoraAportanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async listByAportanteId(aportanteId: number): Promise<MoraAportanteResponse> {
    return firstValueFrom(
      this.http.get<MoraAportanteResponse>(
        `${this.baseUrl}/aportantes/${aportanteId}/mora`,
      ),
    );
  }

  async downloadCertificadoPazYSalvo(aportanteId: number): Promise<void> {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/aportantes/${aportanteId}/certificado/paz-y-salvo`, {
        observe: 'response',
        responseType: 'blob',
      }),
    );

    await this.saveBlobResponse(
      response,
      `certificado_paz_y_salvo_${new Date().toISOString().slice(0, 10)}.docx`,
      'No fue posible generar el certificado de paz y salvo.',
    );
  }

  async downloadCertificadoMora(aportanteId: number): Promise<void> {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/aportantes/${aportanteId}/certificado/mora`, {
        observe: 'response',
        responseType: 'blob',
      }),
    );

    await this.saveBlobResponse(
      response,
      `certificado_mora_${new Date().toISOString().slice(0, 10)}.docx`,
      'No fue posible generar el certificado de mora.',
    );
  }

  private async saveBlobResponse(
    response: HttpResponse<Blob>,
    fallbackFileName: string,
    fallbackErrorMessage: string,
  ): Promise<void> {
    const blob = response.body;

    if (!blob) {
      throw new Error('No se recibió el archivo del certificado.');
    }

    if (blob.type.includes('json')) {
      const message = await this.readApiErrorFromBlob(blob, fallbackErrorMessage);
      throw new Error(message);
    }

    const fileName =
      this.extractFileName(response.headers.get('Content-Disposition')) ??
      fallbackFileName;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private extractFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match = /filename="([^"]+)"/i.exec(contentDisposition);
    return match?.[1] ?? null;
  }

  private async readApiErrorFromBlob(
    blob: Blob,
    fallbackErrorMessage: string,
  ): Promise<string> {
    try {
      const text = await blob.text();
      const payload = JSON.parse(text) as {
        message?: string | string[];
      };

      if (Array.isArray(payload.message)) {
        return payload.message.join(', ');
      }

      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
    } catch {
      // Ignorar errores de parseo y usar mensaje genérico.
    }

    return fallbackErrorMessage;
  }
}
