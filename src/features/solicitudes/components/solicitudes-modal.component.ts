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
import { FormsModule } from '@angular/forms';
import { SolicitudesAportanteService } from '../data-access/solicitudes-aportante.service';
import {
  TIPOS_NOVEDAD_SOLICITUD,
  getTipoNovedadConfig,
} from '../config/documentos-requeridos.config';
import {
  DocumentoRequerido,
  SolicitudAportante,
  TipoNovedadSolicitud,
} from '../interfaces/solicitud-novedad.interface';
import {
  formatDateValue,
  isFormatAllowed,
} from '../utils/solicitudes.helpers';

type VistaSolicitudes = 'listado' | 'nueva';

@Component({
  selector: 'app-solicitudes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-modal.component.html',
})
export class SolicitudesModalComponent {
  private readonly solicitudesService = inject(SolicitudesAportanteService);

  open = input(false);
  aportanteId = input<number | null>(null);

  closed = output<void>();

  vista = signal<VistaSolicitudes>('listado');
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  saveMessage = signal('');

  solicitudes = signal<SolicitudAportante[]>([]);
  total = signal(0);

  tiposNovedad = TIPOS_NOVEDAD_SOLICITUD;
  tipoSeleccionado = signal<TipoNovedadSolicitud | null>(null);
  observacion = signal('');
  archivosPorDocumento = signal<Record<string, File>>({});

  tipoNovedadActivo = computed(() => {
    const id = this.tipoSeleccionado();
    return id ? getTipoNovedadConfig(id) : null;
  });

  totalDocumentosObligatorios = computed(() => {
    const config = this.tipoNovedadActivo();
    if (!config) {
      return 0;
    }

    return config.documentos.filter((doc) => doc.obligatorio).length;
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.vista.set('listado');
        void this.loadSolicitudes();
      } else {
        this.resetNuevaSolicitud();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.open()) {
      return;
    }

    if (this.vista() === 'nueva') {
      this.volverAlListado();
      return;
    }

    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  abrirNuevaSolicitud(): void {
    this.resetNuevaSolicitud();
    this.vista.set('nueva');
  }

  volverAlListado(): void {
    this.resetNuevaSolicitud();
    this.vista.set('listado');
  }

  seleccionarTipo(id: TipoNovedadSolicitud): void {
    if (this.tipoSeleccionado() === id) {
      return;
    }

    this.tipoSeleccionado.set(id);
    this.archivosPorDocumento.set({});
    this.saveMessage.set('');
  }

  isSelected(id: TipoNovedadSolicitud): boolean {
    return this.tipoSeleccionado() === id;
  }

  formatosLabel(formatos: string[]): string {
    return formatos.join(', ');
  }

  formatDate(value: string | null | undefined): string {
    const formatted = formatDateValue(value);
    return formatted || '—';
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }

  onObservacionInput(event: Event): void {
    this.observacion.set((event.target as HTMLTextAreaElement).value);
  }

  onFileSelected(doc: DocumentoRequerido, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!isFormatAllowed(file.name, doc.formatosPermitidos)) {
      this.saveMessage.set(
        `El archivo "${file.name}" no cumple los formatos permitidos (${this.formatosLabel(doc.formatosPermitidos)}).`,
      );
      input.value = '';
      return;
    }

    this.saveMessage.set('');
    this.archivosPorDocumento.update((current) => ({
      ...current,
      [doc.id]: file,
    }));
  }

  getArchivoNombre(docId: string): string | null {
    return this.archivosPorDocumento()[docId]?.name ?? null;
  }

  tieneArchivo(docId: string): boolean {
    return Boolean(this.archivosPorDocumento()[docId]);
  }

  async guardarSolicitud(): Promise<void> {
    const aportanteId = this.aportanteId();
    const config = this.tipoNovedadActivo();
    const observacion = this.observacion().trim();

    if (!aportanteId) {
      this.saveMessage.set('No se encontró un aportante asociado al usuario.');
      return;
    }

    if (!config) {
      this.saveMessage.set('Seleccione un tipo de novedad.');
      return;
    }

    if (!observacion) {
      this.saveMessage.set('La observación es obligatoria.');
      return;
    }

    const faltantes = config.documentos.filter(
      (doc) => doc.obligatorio && !this.archivosPorDocumento()[doc.id],
    );

    if (faltantes.length > 0) {
      this.saveMessage.set(
        `Faltan documentos obligatorios: ${faltantes.map((doc) => doc.nombre).join(', ')}.`,
      );
      return;
    }

    const archivos = Object.values(this.archivosPorDocumento());
    const formData = new FormData();
    formData.append('tipoNovedadId', String(config.tipoNovedadId));
    formData.append('observacion', observacion);

    for (const archivo of archivos) {
      formData.append('files', archivo, archivo.name);
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    try {
      await this.solicitudesService.create(aportanteId, formData);
      this.vista.set('listado');
      this.resetNuevaSolicitud();
      await this.loadSolicitudes();
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible guardar la solicitud.';

      this.saveMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadSolicitudes(): Promise<void> {
    const aportanteId = this.aportanteId();

    if (!aportanteId) {
      this.errorMessage.set('No se encontró un aportante asociado al usuario.');
      this.solicitudes.set([]);
      this.total.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response =
        await this.solicitudesService.listByAportanteId(aportanteId);
      this.solicitudes.set(response.solicitudes);
      this.total.set(response.total);
    } catch (error: unknown) {
      const message =
        (error as { error?: { message?: string | string[] } })?.error?.message ??
        'No fue posible cargar las solicitudes del aportante.';

      this.errorMessage.set(
        Array.isArray(message) ? message.join(', ') : String(message),
      );
      this.solicitudes.set([]);
      this.total.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private resetNuevaSolicitud(): void {
    this.tipoSeleccionado.set(null);
    this.observacion.set('');
    this.archivosPorDocumento.set({});
    this.saveMessage.set('');
  }
}
