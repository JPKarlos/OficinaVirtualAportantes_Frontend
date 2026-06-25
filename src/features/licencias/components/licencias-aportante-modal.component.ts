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
import { LicenciasAportanteService } from '../data-access/licencias-aportante.service';
import { LicenciaAportante } from '../interfaces/licencia-aportante.interface';
import {
  buildIdentificacionFromLicencia,
  exportLicenciasToExcel,
  formatDateValue,
  formatMoneyValue,
} from '../utils/licencias-excel.export';

@Component({
  selector: 'app-licencias-aportante-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './licencias-aportante-modal.component.html',
})
export class LicenciasAportanteModalComponent {
  private readonly licenciasService = inject(LicenciasAportanteService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  licencias = signal<LicenciaAportante[]>([]);
  total = signal(0);

  licenciasFiltradas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.licencias();

    if (!term) {
      return items;
    }

    return items.filter((item) => this.matchesSearch(item, term));
  });

  totalFiltrado = computed(() => this.licenciasFiltradas().length);

  tieneFiltroActivo = computed(() => this.searchTerm().trim().length > 0);

  identificacionAportante = computed(() =>
    buildIdentificacionFromLicencia(this.licencias()[0]),
  );

  nombreRazonSocial = computed(() => {
    const value = this.licencias()[0]?.nombreRazonSocial?.trim();
    return value || '—';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        void this.loadLicencias();
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

  formatMoney(value: number | null | undefined): string {
    const formatted = formatMoneyValue(value);
    return formatted || '—';
  }

  exportToExcel(): void {
    const registros = this.licenciasFiltradas();

    if (registros.length === 0) {
      return;
    }

    exportLicenciasToExcel(
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

  private matchesSearch(item: LicenciaAportante, term: string): boolean {
    const values = [
      item.codigoEps,
      formatDateValue(item.fechaRadicacion),
      item.tipoDocumento,
      item.documento,
      item.apellido1,
      item.apellido2,
      item.nombre1,
      item.nombre2,
      item.nombreCompleto,
      formatMoneyValue(item.salario),
      item.tipoSalario,
      formatDateValue(item.fechaInicio),
      formatDateValue(item.fechaFinLicencia),
      item.diasReconocer,
      formatDateValue(item.fechaPago),
      item.pagada,
      formatMoneyValue(item.vrAPagar),
      item.radicacion,
      item.tipoPrestacionEconomica,
      item.tipoLicencia,
      item.diasGestacion,
      item.diasPrematuro,
      formatDateValue(item.fechaParto),
      formatDateValue(item.fechaPp),
      item.estadoNovedad,
      item.nroComprobante,
    ];

    return values.some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term),
    );
  }

  private async loadLicencias(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado al usuario.');
      this.licencias.set([]);
      this.total.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.searchTerm.set('');
    this.licencias.set([]);
    this.total.set(0);

    try {
      const response =
        await this.licenciasService.listByAportanteId(aportanteId);
      this.licencias.set(response.licencias);
      this.total.set(response.total);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible cargar las licencias del aportante.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
