import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoraAportanteService } from '../data-access/mora-aportante.service';
import { MoraAportanteRegistro } from '../interfaces/mora-aportante.interface';
import {
  buildIdentificacionFromRegistro,
  exportMoraToExcel,
  formatCurrency,
  formatDateValue,
} from '../utils/mora-excel.export';

@Component({
  selector: 'app-mora-aportante-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mora-aportante-modal.component.html',
})
export class MoraAportanteModalComponent {
  private readonly moraService = inject(MoraAportanteService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  isLoading = signal(false);
  isGeneratingCertificado = signal(false);
  isGeneratingCertificadoMora = signal(false);
  certificadoErrorMessage = signal('');
  certificadoMoraErrorMessage = signal('');
  errorMessage = signal('');
  registros = signal<MoraAportanteRegistro[]>([]);
  total = signal(0);

  hasRegistros = computed(() => this.registros().length > 0);
  sinRegistros = computed(
    () => !this.isLoading() && !this.errorMessage() && this.registros().length === 0,
  );

  identificacionAportante = computed(() =>
    buildIdentificacionFromRegistro(this.registros()[0]),
  );

  nombreRazonSocial = computed(() => {
    const value = this.registros()[0]?.nombreRazonSocial?.trim();
    return value || '—';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        void this.loadMora();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }

  formatMoney(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }

    return formatCurrency(value);
  }

  formatDate(value: string | null | undefined): string {
    const formatted = formatDateValue(value);
    return formatted || '—';
  }

  exportToExcel(): void {
    if (this.registros().length === 0) {
      return;
    }

    exportMoraToExcel(
      this.registros(),
      this.identificacionAportante(),
      this.nombreRazonSocial(),
    );
  }

  onCertificadoPazYSalvo(): void {
    void this.generateCertificadoPazYSalvo();
  }

  onCertificadoMora(): void {
    void this.generateCertificadoMora();
  }

  private async generateCertificadoMora(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.certificadoMoraErrorMessage.set(
        'No se encontró un aportante asociado al usuario.',
      );
      return;
    }

    this.isGeneratingCertificadoMora.set(true);
    this.certificadoMoraErrorMessage.set('');

    try {
      await this.moraService.downloadCertificadoMora(aportanteId);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'No fue posible generar el certificado de mora.';

      this.certificadoMoraErrorMessage.set(message);
    } finally {
      this.isGeneratingCertificadoMora.set(false);
    }
  }

  private async generateCertificadoPazYSalvo(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.certificadoErrorMessage.set(
        'No se encontró un aportante asociado al usuario.',
      );
      return;
    }

    this.isGeneratingCertificado.set(true);
    this.certificadoErrorMessage.set('');

    try {
      await this.moraService.downloadCertificadoPazYSalvo(aportanteId);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'No fue posible generar el certificado de paz y salvo.';

      this.certificadoErrorMessage.set(message);
    } finally {
      this.isGeneratingCertificado.set(false);
    }
  }

  private async loadMora(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado al usuario.');
      this.registros.set([]);
      this.total.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.certificadoErrorMessage.set('');
    this.certificadoMoraErrorMessage.set('');
    this.registros.set([]);
    this.total.set(0);

    try {
      const response = await this.moraService.listByAportanteId(aportanteId);
      this.registros.set(response.registros);
      this.total.set(response.total);
    } catch (error: unknown) {
      const httpError = error as {
        error?: { message?: string | string[]; statusCode?: number };
        message?: string;
        status?: number;
      };

      const apiMessage = httpError.error?.message ?? httpError.message;
      const statusCode = httpError.error?.statusCode ?? httpError.status;

      if (statusCode === 408) {
        this.errorMessage.set(
          'La consulta de mora está tardando más de lo esperado. Intente nuevamente en unos momentos.',
        );
        return;
      }

      if (Array.isArray(apiMessage)) {
        this.errorMessage.set(apiMessage.join(', '));
        return;
      }

      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        this.errorMessage.set(apiMessage);
        return;
      }

      this.errorMessage.set('No fue posible cargar la mora del aportante.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
