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
import { IncapacidadesAportanteService } from '../data-access/incapacidades-aportante.service';
import { IncapacidadAportante } from '../interfaces/incapacidad-aportante.interface';
import {
  buildIdentificacionFromIncapacidad,
  exportIncapacidadesToExcel,
  formatDateValue,
} from '../utils/incapacidades-excel.export';

@Component({
  selector: 'app-incapacidades-aportante-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incapacidades-aportante-modal.component.html',
})
export class IncapacidadesAportanteModalComponent {
  private readonly incapacidadesService = inject(IncapacidadesAportanteService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  incapacidades = signal<IncapacidadAportante[]>([]);
  total = signal(0);

  incapacidadesFiltradas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.incapacidades();

    if (!term) {
      return items;
    }

    return items.filter((item) => this.matchesSearch(item, term));
  });

  totalFiltrado = computed(() => this.incapacidadesFiltradas().length);

  tieneFiltroActivo = computed(() => this.searchTerm().trim().length > 0);

  identificacionAportante = computed(() =>
    buildIdentificacionFromIncapacidad(this.incapacidades()[0]),
  );

  nombreRazonSocial = computed(() => {
    const value = this.incapacidades()[0]?.nombreRazonSocial?.trim();
    return value || '—';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        void this.loadIncapacidades();
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

  formatDate(value: string | null | undefined): string {
    const formatted = formatDateValue(value);
    return formatted || '—';
  }

  exportToExcel(): void {
    const registros = this.incapacidadesFiltradas();

    if (registros.length === 0) {
      return;
    }

    exportIncapacidadesToExcel(
      registros,
      this.identificacionAportante(),
      this.nombreRazonSocial(),
    );
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  private matchesSearch(item: IncapacidadAportante, term: string): boolean {
    const values = [
      item.incapacidadId,
      item.afiliadoId,
      item.tipoDocumento,
      item.documento,
      item.apellido1,
      item.apellido2,
      item.nombre1,
      item.nombre2,
      item.nombreCompleto,
      item.genero,
      formatDateValue(item.fechaInicio),
      formatDateValue(item.fechaFin),
      formatDateValue(item.fechaRadicado),
      item.barCode,
      item.codDiagnostico,
      item.diagnostico,
      item.estadoNovedad,
      item.observacionesRegistro,
      item.tipoIncapacidad,
      formatDateValue(item.fechaPago),
      item.pagoPor,
      item.comprobante,
      item.estadoPago,
    ];

    return values.some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term),
    );
  }

  private async loadIncapacidades(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado al usuario.');
      this.incapacidades.set([]);
      this.total.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.searchTerm.set('');
    this.incapacidades.set([]);
    this.total.set(0);

    try {
      const response =
        await this.incapacidadesService.listByAportanteId(aportanteId);
      this.incapacidades.set(response.incapacidades);
      this.total.set(response.total);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible cargar las incapacidades del aportante.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
