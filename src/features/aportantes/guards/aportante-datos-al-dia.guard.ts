import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';

export const aportanteDatosAlDiaGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const estado = authService.getEstadoActualizacion()?.estado;

  if (estado === 'MENOR_6_MESES') {
    return true;
  }

  return router.createUrlTree(['/home']);
};
