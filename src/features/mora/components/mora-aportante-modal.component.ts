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
import { AportantesService } from '../../aportantes/data-access/aportantes.service';
import { AportanteDetail } from '../../aportantes/interfaces/aportante-detail.interface';
import { AccesoriaService } from '../../aportantes/data-access/accesoria.service';
import {
  buildIdentificacionFromRegistro,
  exportMoraToExcel,
  formatCurrency,
  formatDateValue,
} from '../utils/mora-excel.export';
import { generateCertificadoMoraPdf } from '../utils/certificado-mora.pdf';
import { generateCertificadoPazYSalvoPdf } from '../utils/certificado-paz-y-salvo.pdf';

@Component({
  selector: 'app-mora-aportante-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mora-aportante-modal.component.html',
})
export class MoraAportanteModalComponent {
  private readonly moraService = inject(MoraAportanteService);
  private readonly aportantesService = inject(AportantesService);
  private readonly accesoriaService = inject(AccesoriaService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  isLoading = signal(false);
  isGeneratingCertificado = signal(false);
  isGeneratingCertificadoMora = signal(false);
  certificadoErrorMessage = signal('');
  certificadoMoraErrorMessage = signal('');
  errorMessage = signal('');
  searchTerm = signal('');
  registros = signal<MoraAportanteRegistro[]>([]);
  total = signal(0);
  aportanteInfo = signal<AportanteDetail | null>(null);
  tipoAportante = signal('');

  hasRegistros = computed(() => this.registros().length > 0);
  sinRegistros = computed(
    () => !this.isLoading() && !this.errorMessage() && this.registros().length === 0,
  );

  registrosFiltrados = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.registros();

    if (!term) {
      return items;
    }

    return items.filter((item) => this.matchesSearch(item, term));
  });

  totalFiltrado = computed(() => this.registrosFiltrados().length);

  tieneFiltroActivo = computed(() => this.searchTerm().trim().length > 0);

  identificacionAportante = computed(() => {
    const aportante = this.aportanteInfo();

    if (aportante?.idenAportante) {
      const iden = aportante.idenAportante.trim();
      const dv = aportante.dvAportante?.trim();
      const numero = dv ? `${iden}-${dv}` : iden;
      const tipo =
        this.tipoAportante().trim() ||
        this.registros()[0]?.tipo?.trim() ||
        '';
      return tipo ? `${tipo} ${numero}` : numero;
    }

    return buildIdentificacionFromRegistro(this.registros()[0]);
  });

  nombreRazonSocial = computed(() => {
    const aportante = this.aportanteInfo();

    if (aportante?.nombreRazonSocial?.trim()) {
      return aportante.nombreRazonSocial.trim();
    }

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
    const registros = this.registrosFiltrados();

    if (registros.length === 0) {
      return;
    }

    exportMoraToExcel(
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

  private matchesSearch(item: MoraAportanteRegistro, term: string): boolean {
    const values = [
      item.anio,
      item.numMes,
      item.fechaMaximoPago,
      item.tipoDocCotizante,
      item.documento,
      item.apellido1,
      item.apellido2,
      item.nombre1,
      item.nombre2,
      item.nombreCompleto,
      item.codTipCot,
      item.tipoCotizante,
      item.codEstadoAfiliacion,
      item.desRegimen,
      item.correoElectronicoCotizante,
      item.telefonoCotizante,
      item.valorPeriodo,
      item.cantidadRegistros,
      item.tipo,
      item.idenAportante,
      item.dvAportante,
      item.nombreRazonSocial,
      item.correoElectronicoAportante,
      item.telefonoAportante,
    ];

    return values.some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term),
    );
  }

  onCertificadoPazYSalvo(): void {
    void this.generateCertificadoPazYSalvo();
  }

  onCertificadoMora(): void {
    void this.generateCertificadoMora();
  }

  private async generateCertificadoMora(): Promise<void> {
    const registros = this.registros();

    if (registros.length === 0) {
      this.certificadoMoraErrorMessage.set(
        'No hay registros de mora para generar el certificado.',
      );
      return;
    }

    this.isGeneratingCertificadoMora.set(true);
    this.certificadoMoraErrorMessage.set('');

    try {
      await generateCertificadoMoraPdf(
        registros,
        this.identificacionAportante(),
        this.nombreRazonSocial(),
      );
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
    this.isGeneratingCertificado.set(true);
    this.certificadoErrorMessage.set('');

    try {
      await generateCertificadoPazYSalvoPdf(
        this.nombreRazonSocial(),
        this.identificacionAportante(),
      );
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

  private async loadAportanteData(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.aportanteInfo.set(null);
      this.tipoAportante.set('');
      return;
    }

    try {
      const aportante = await this.aportantesService.getById(aportanteId);
      this.aportanteInfo.set(aportante);

      const tipos = await this.accesoriaService.listTipoIdenCont();
      const tipo = tipos.find(
        (item) => item.tipoIdenContId === aportante.apidentificacionId,
      );
      this.tipoAportante.set(tipo?.tipo?.trim() ?? '');
    } catch {
      this.aportanteInfo.set(null);
      this.tipoAportante.set('');
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
    this.searchTerm.set('');
    this.registros.set([]);
    this.total.set(0);

    try {
      await this.loadAportanteData();

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
