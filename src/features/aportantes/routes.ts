import { Routes } from '@angular/router';

export const APORTANTES_ROUTES: Routes = [
  {
    path: 'crear',
    loadComponent: () => import('./pages/create-aportante.component'),
  },
  {
    path: 'actualizar-datos',
    loadComponent: () => import('./pages/update-ultima-actualizacion.component'),
  },
];
