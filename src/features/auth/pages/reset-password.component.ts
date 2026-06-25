import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../data-access/auth.service';
import MallamasButtonComponent from '../../../shared/ui/button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MallamasButtonComponent],
  templateUrl: './reset-password.component.html'
})
export default class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  token = signal<string>('');

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Obtener el token de los parámetros de la ruta
    // Ejemplo de URL: /auth/reset-password/abc123def456
    this.route.params.subscribe(params => {
      this.token.set(params['token'] || '');
    });
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid && this.token()) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { password } = this.resetPasswordForm.value;

      try {
        const result = await this.authService.resetPassword({ 
          token: this.token(), 
          newPassword: password 
        });
        
        if (result.success) {
          this.successMessage.set('Su contraseña ha sido restablecida exitosamente. Será redirigido al login en unos segundos.');
          this.resetPasswordForm.reset();
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.errorMessage.set(result.error || 'Error al restablecer la contraseña');
        }
      } catch (error) {
        this.errorMessage.set('Error de conexión. Por favor, intente nuevamente.');
      } finally {
        this.isLoading.set(false);
      }
    } else if (!this.token()) {
      this.errorMessage.set('Token de restauración inválido o expirado.');
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