import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { APP_STORAGE_KEYS } from '../constants/app-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);

  constructor() {
    this.initializeRouteTracking();
  }

  private initializeRouteTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // No guardar rutas de autenticación
      if (!event.url.includes('/auth/')) {
        localStorage.setItem(APP_STORAGE_KEYS.route, event.url);
      }
    });
  }

  // Método para navegar y actualizar localStorage
  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }

  // Método para limpiar la ruta guardada
  clearSavedRoute() {
    localStorage.removeItem(APP_STORAGE_KEYS.route);
  }
} 