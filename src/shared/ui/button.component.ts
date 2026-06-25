import { Component, input, output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline-primary' | 'outline-success';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'mallamas-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      (click)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `
})
export default class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  onClick = output<Event>();
  
  @Input() class: string = '';

  buttonClasses() {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
    
    const variantClasses = {
      'primary': 'bg-mallamas-green-600 hover:bg-mallamas-green-700 text-white focus:ring-mallamas-green-500',
      'secondary': 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      'success': 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      'danger': 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      'warning': 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
      'outline-primary': 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
      'outline-success': 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500'
    };

    const sizeClasses = {
      'sm': 'py-1 px-3 text-sm',
      'md': 'py-2 px-4 text-base',
      'lg': 'py-3 px-6 text-lg'
    };

    const disabledClasses = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${disabledClasses} ${this.class}`;
  }
} 