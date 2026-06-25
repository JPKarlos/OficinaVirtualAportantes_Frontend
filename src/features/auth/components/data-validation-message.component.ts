import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessageConfig } from '../interfaces/ultima-actualizacion.interface';

@Component({
  selector: 'app-data-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="config && hasVisibleContent()" 
      [ngClass]="getContainerClasses()"
      class="rounded-lg p-4 mb-6"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg 
            [ngClass]="getIconClasses()"
            class="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              *ngIf="config.colorScheme === 'update'"
              fill-rule="evenodd" 
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
              clip-rule="evenodd" 
            />
            <path 
              *ngIf="config.colorScheme === 'register'"
              fill-rule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" 
              clip-rule="evenodd" 
            />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 [ngClass]="getTitleClasses()" class="text-sm font-medium">
            {{ config.title }}
          </h3>
          <div [ngClass]="getMessageClasses()" class="mt-2 text-sm">
            <p>{{ config.message }}</p>
          </div>
          <div class="mt-4" *ngIf="config.showButton">
            <button
              type="button"
              (click)="onButtonClick()"
              [disabled]="isLoading"
              [ngClass]="getButtonClasses()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg 
                *ngIf="isLoading" 
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  class="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  stroke-width="4"
                ></circle>
                <path 
                  class="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ config.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DataValidationMessageComponent {
  @Input() config: ValidationMessageConfig | null = null;
  @Input() isLoading: boolean = false;
  @Output() buttonClicked = new EventEmitter<
    'update' | 'register' | 'create-aportante' | 'update-ultima-actualizacion'
  >();

  onButtonClick(): void {
    if (this.config && !this.isLoading) {
      this.buttonClicked.emit(this.config.buttonAction);
    }
  }

  hasVisibleContent(): boolean {
    return !!(this.config?.title || this.config?.message || this.config?.showButton);
  }

  getContainerClasses(): string {
    if (!this.config) return '';
    
    if (this.config.colorScheme === 'register') {
      return 'bg-blue-50 border border-blue-200';
    } else {
      return 'bg-yellow-50 border border-yellow-200';
    }
  }

  getIconClasses(): string {
    if (!this.config) return '';
    
    if (this.config.colorScheme === 'register') {
      return 'text-blue-400';
    } else {
      return 'text-yellow-400';
    }
  }

  getTitleClasses(): string {
    if (!this.config) return '';
    
    if (this.config.colorScheme === 'register') {
      return 'text-blue-800';
    } else {
      return 'text-yellow-800';
    }
  }

  getMessageClasses(): string {
    if (!this.config) return '';
    
    if (this.config.colorScheme === 'register') {
      return 'text-blue-700';
    } else {
      return 'text-yellow-700';
    }
  }

  getButtonClasses(): string {
    if (!this.config) return '';
    
    if (this.config.colorScheme === 'register') {
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    } else {
      return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
    }
  }
}


