import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-password-restore',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './password-restore.component.html'
})
export default class PasswordRestoreComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  constructor() {
    this.resetPasswordForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get username() {
    return this.resetPasswordForm.get('username');
  }

  get email() {
    return this.resetPasswordForm.get('email');
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { username, email } = this.resetPasswordForm.value;

      try {
        const result = await this.authService.passwordRestore({ username, email });
        
        if (result.success) {
          this.successMessage.set('Se ha enviado un enlace de restauración a su correo electrónico. El enlace tendrá el formato: /auth/reset-password/[token]');
          this.resetPasswordForm.reset();
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.errorMessage.set(result.error || 'Error al enviar el enlace de restauración');
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
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }
} 