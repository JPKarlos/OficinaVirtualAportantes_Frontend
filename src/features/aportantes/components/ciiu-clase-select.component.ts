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
import { CiiuClase } from '../interfaces/ciiu-clase.interface';
import { AccesoriaService } from '../data-access/accesoria.service';

@Component({
  selector: 'app-ciiu-clase-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CiiuClaseSelectComponent),
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
        <span [class.text-gray-400]="!selectedCiiuClase()" class="truncate pr-2">
          {{ selectedLabel() }}
        </span>
        <svg class="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
              placeholder="Buscar actividad económica..."
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <ul class="max-h-60 overflow-y-auto py-1">
            @if (isLoading()) {
              <li class="px-3 py-2 text-sm text-gray-500">Cargando actividades...</li>
            } @else if (filteredItems().length === 0) {
              <li class="px-3 py-2 text-sm text-gray-500">No se encontraron actividades económicas</li>
            } @else {
              @for (item of filteredItems(); track item.ciiuClaseId) {
                <li>
                  <button
                    type="button"
                    (click)="selectItem(item)"
                    class="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-blue-50"
                    [class.bg-blue-100]="value === item.ciiuClaseId"
                  >
                    <span class="font-medium text-gray-900">
                      {{ item.codigo }} - {{ item.descripcion }}
                    </span>
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
export class CiiuClaseSelectComponent implements ControlValueAccessor {
  private readonly accesoriaService = inject(AccesoriaService);
  private readonly elementRef = inject(ElementRef);

  @Input() label = 'Actividad económica';
  @Input() required = false;
  @Input() invalid = false;
  @Input() touched = false;
  @Input() inputId = 'ciiuClaseId';

  items = signal<CiiuClase[]>([]);
  filteredItems = signal<CiiuClase[]>([]);
  selectedCiiuClase = signal<CiiuClase | null>(null);
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
    this.loadItems();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  writeValue(value: number | null): void {
    this.value = value;
    this.syncSelectedItem();
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
    const selected = this.selectedCiiuClase();
    if (!selected) {
      return 'Seleccione una actividad económica...';
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
      this.filteredItems.set(this.items());
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(async () => {
      await this.loadItems(this.searchTerm);
    }, 300);
  }

  selectItem(item: CiiuClase): void {
    this.value = item.ciiuClaseId;
    this.selectedCiiuClase.set(item);
    this.onChange(item.ciiuClaseId);
    this.onTouched();
    this.closeDropdown();
  }

  private async loadItems(search?: string): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const items = await this.accesoriaService.listCiiuClase(search);
      this.items.set(items);
      this.filteredItems.set(items);
      this.syncSelectedItem();
    } catch {
      this.loadError.set('No fue posible cargar las actividades económicas.');
      this.items.set([]);
      this.filteredItems.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private syncSelectedItem(): void {
    if (this.value == null) {
      this.selectedCiiuClase.set(null);
      return;
    }

    const selected = this.items().find((item) => item.ciiuClaseId === this.value) ?? null;
    this.selectedCiiuClase.set(selected);
  }
}
