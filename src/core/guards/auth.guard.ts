import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { AuthStatus } from '../../features/auth/interfaces/auth-status.enum';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === AuthStatus.authenticated) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
}; 