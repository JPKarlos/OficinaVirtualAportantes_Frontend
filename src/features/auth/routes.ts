import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component')
  },
  {
    path: 'password-restore',
    loadComponent: () => import('./pages/password-restore.component')
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/reset-password.component')
  },
  {
    path: 'change-password',
    loadComponent: () => import('./pages/change-password.component')
  }
]; 