import { Routes } from '@angular/router';
import { aportanteDatosAlDiaGuard } from './guards/aportante-datos-al-dia.guard';

export const APORTANTES_ROUTES: Routes = [
  {
    path: 'crear',
    loadComponent: () => import('./pages/create-aportante.component'),
  },
  {
    path: 'actualizar-datos',
    loadComponent: () => import('./pages/update-ultima-actualizacion.component'),
  },
  {
    path: 'actualizar-mis-datos',
    canActivate: [aportanteDatosAlDiaGuard],
    loadComponent: () => import('./pages/actualizar-mis-datos.component'),
  },
];
