import {
  Component,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Municipio } from '../interfaces/municipio.interface';
import { AccesoriaService } from '../data-access/accesoria.service';

@Component({
  selector: 'app-municipio-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MunicipioSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative" #container>
      <label *ngIf="label" [for]="inputId" class="block text-sm font-medium text-gray-700">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <button
        type="button"
        [id]="inputId"
        (click)="toggleDropdown()"
        [disabled]="disabled || isLoading()"
        class="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        [class.border-red-300]="invalid && touched"
      >
        <span [class.text-gray-400]="!selectedMunicipio()">
          {{ selectedLabel() }}
        </span>
        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd" />
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div class="border-b border-gray-100 p-2">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              [ngModelOptions]="{ standalone: true }"
              (input)="onSearchChange()"
              placeholder="Buscar municipio..."
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <ul class="max-h-60 overflow-y-auto py-1">
            @if (isLoading()) {
              <li class="px-3 py-2 text-sm text-gray-500">Cargando municipios...</li>
            } @else if (filteredMunicipios().length === 0) {
              <li class="px-3 py-2 text-sm text-gray-500">No se encontraron municipios</li>
            } @else {
              @for (municipio of filteredMunicipios(); track municipio.municipioIde) {
                <li>
                  <button
                    type="button"
                    (click)="selectMunicipio(municipio)"
                    class="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-blue-50"
                    [class.bg-blue-100]="value === municipio.municipioIde"
                  >
                    <span class="font-medium text-gray-900">
                      {{ municipio.codigo }} - {{ municipio.descripcion }}
                    </span>
                    @if (municipio.departamento) {
                      <span class="text-xs text-gray-500">
                        {{ municipio.departamento.descripcion }}
                      </span>
                    }
                  </button>
                </li>
              }
            }
          </ul>
        </div>
      }

      @if (loadError()) {
        <p class="mt-1 text-sm text-red-600">{{ loadError() }}</p>
      }
    </div>
  `,
})
export class MunicipioSelectComponent implements ControlValueAccessor {
  private readonly accesoriaService = inject(AccesoriaService);
  private readonly elementRef = inject(ElementRef);

  @Input() label = 'Municipio';
  @Input() required = false;
  @Input() invalid = false;
  @Input() touched = false;
  @Input() inputId = 'municipioIde';

  municipios = signal<Municipio[]>([]);
  filteredMunicipios = signal<Municipio[]>([]);
  selectedMunicipio = signal<Municipio | null>(null);
  isOpen = signal(false);
  isLoading = signal(false);
  loadError = signal('');

  searchTerm = '';
  value: number | null = null;
  disabled = false;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadMunicipios();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  writeValue(value: number | null): void {
    this.value = value;
    this.syncSelectedMunicipio();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  selectedLabel(): string {
    const selected = this.selectedMunicipio();
    if (!selected) {
      return 'Seleccione un municipio...';
    }

    return `${selected.codigo} - ${selected.descripcion}`;
  }

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen.update((open) => !open);
    this.onTouched();

    if (this.isOpen()) {
      this.searchTerm = '';
      this.filteredMunicipios.set(this.municipios());
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(async () => {
      await this.loadMunicipios(this.searchTerm);
    }, 300);
  }

  selectMunicipio(municipio: Municipio): void {
    this.value = municipio.municipioIde;
    this.selectedMunicipio.set(municipio);
    this.onChange(municipio.municipioIde);
    this.onTouched();
    this.closeDropdown();
  }

  private async loadMunicipios(search?: string): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const municipios = await this.accesoriaService.listMunicipios(search);
      this.municipios.set(municipios);
      this.filteredMunicipios.set(municipios);
      this.syncSelectedMunicipio();
    } catch {
      this.loadError.set('No fue posible cargar los municipios.');
      this.municipios.set([]);
      this.filteredMunicipios.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private syncSelectedMunicipio(): void {
    if (this.value == null) {
      this.selectedMunicipio.set(null);
      return;
    }

    const selected =
      this.municipios().find((municipio) => municipio.municipioIde === this.value) ?? null;
    this.selectedMunicipio.set(selected);
  }
}
