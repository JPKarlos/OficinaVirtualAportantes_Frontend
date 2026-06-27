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
import { AfiliadosAsociadosService } from '../data-access/afiliados-asociados.service';
import { AfiliadoAsociado } from '../interfaces/afiliado-asociado.interface';
import {
  exportAfiliadosToExcel,
  formatEstadoRelacionLaboral,
  formatIdentificacionCompletaAportante,
} from '../utils/afiliados-excel.export';
import { generateCertificadoAfiliacionPdf } from '../utils/certificado-afiliacion.pdf';

@Component({
  selector: 'app-afiliados-asociados-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './afiliados-asociados-modal.component.html',
})
export class AfiliadosAsociadosModalComponent {
  private readonly afiliadosService = inject(AfiliadosAsociadosService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  isLoading = signal(false);
  generatingCertificadoHistoricoId = signal<number | null>(null);
  errorMessage = signal('');
  afiliados = signal<AfiliadoAsociado[]>([]);
  total = signal(0);

  identificacionAportante = computed(() => {
    const first = this.afiliados()[0];
    if (!first) {
      return '—';
    }

    return formatIdentificacionCompletaAportante(
      first.tipoApt,
      first.idenAportante,
      first.dvAportante,
    );
  });

  nombreRazonSocial = computed(() => {
    const value = this.afiliados()[0]?.nombreRazonSocial?.trim();
    return value || '—';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        void this.loadAfiliados();
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

  formatEstado(value: number | null | undefined): string {
    const label = formatEstadoRelacionLaboral(value);
    return label || '—';
  }

  estadoBadgeClass(value: number | null | undefined): string {
    if (value === 1) {
      return 'bg-green-100 text-green-800';
    }

    if (value === 0) {
      return 'bg-gray-100 text-gray-700';
    }

    return 'bg-yellow-100 text-yellow-800';
  }

  exportToExcel(): void {
    if (this.afiliados().length === 0) {
      return;
    }

    exportAfiliadosToExcel(
      this.afiliados(),
      this.identificacionAportante(),
      this.nombreRazonSocial(),
    );
  }

  isGeneratingCertificado(historicoId: number): boolean {
    return this.generatingCertificadoHistoricoId() === historicoId;
  }

  generateCertificadoAfiliacion(afiliado: AfiliadoAsociado): void {
    this.generatingCertificadoHistoricoId.set(afiliado.historicoId);

    try {
      generateCertificadoAfiliacionPdf(afiliado);
    } finally {
      this.generatingCertificadoHistoricoId.set(null);
    }
  }

  private async loadAfiliados(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado al usuario.');
      this.afiliados.set([]);
      this.total.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.afiliados.set([]);
    this.total.set(0);

    try {
      const response = await this.afiliadosService.listByAportanteId(aportanteId);
      this.afiliados.set(response.afiliados);
      this.total.set(response.total);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible cargar los afiliados asociados.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
