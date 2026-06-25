import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('../features/auth/routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadChildren: () => import('../features/home/routes').then(m => m.HOME_ROUTES)
    },
    {
        path: 'aportantes',
        canActivate: [authGuard],
        loadChildren: () => import('../features/aportantes/routes').then(m => m.APORTANTES_ROUTES)
    },
    
    {
        path: '**',
        loadComponent: () => import('../pages/not-found/not-found.component')
    }
];
