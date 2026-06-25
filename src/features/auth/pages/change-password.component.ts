import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../data-access/auth.service';
import MallamasButtonComponent from '../../../shared/ui/button.component';
import LayoutComponent from '../../../shared/ui/layout.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MallamasButtonComponent, LayoutComponent],
  templateUrl: './change-password.component.html'
})
export default class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  changePasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  constructor() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get currentPassword() {
    return this.changePasswordForm.get('currentPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  async onSubmit() {
    if (this.changePasswordForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { currentPassword, newPassword } = this.changePasswordForm.value;

      try {
        const result = await this.authService.changePassword({ 
          currentPassword, 
          newPassword, 
          confirmPassword: newPassword 
        });
        
        if (result.success) {
          this.successMessage.set('Su contraseña ha sido cambiada exitosamente.');
          this.changePasswordForm.reset();
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          this.errorMessage.set(result.error || 'Error al cambiar la contraseña');
        }
      } catch (error) {
        this.errorMessage.set('Error de conexión. Por favor, intente nuevamente.');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      const control = this.changePasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }
} 