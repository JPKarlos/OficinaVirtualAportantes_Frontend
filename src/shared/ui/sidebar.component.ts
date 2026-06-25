import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { environment } from '../../environments/environment';
import { VersionService } from '../services/version.service';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  isActive?: boolean;
  subItems?: SubMenuItem[];
  isOpen?: boolean;
}

interface SubMenuItem {
  id: string;
  title: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export default class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly versionService = inject(VersionService);

  menuItems = input<MenuItem[]>([]);
  isMobileMenuOpen = input<boolean>(false);
  
  // Signal para manejar qué submenú está abierto
  openSubMenuId = signal<string | null>(null);

  // Getters para la información del usuario
  get currentUser() {
    return this.authService.currentUser();
  }

  get userEmail() {
    return this.currentUser?.email || 'usuario@ejemplo.com';
  }

  get userName() {
    return this.currentUser?.nombre || 'Usuario';
  }

  get appName() {
    return environment.appName;
  }

  get isProduction() {
    return environment.production;
  }

  get appVersion() {
    return this.versionService.currentVersion();
  }

  toggleMobileMenu() {
    // This would typically emit an event to parent component
    console.log('Toggle mobile menu');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleSubMenu(itemId: string) {
    // Toggle the submenu open/close state
    const currentOpen = this.openSubMenuId();
    if (currentOpen === itemId) {
      // Si está abierto, lo cerramos
      this.openSubMenuId.set(null);
    } else {
      // Si está cerrado o es otro, abrimos este
      this.openSubMenuId.set(itemId);
    }
  }

  // Método helper para verificar si un submenú está abierto
  isSubMenuOpen(itemId: string): boolean {
    return this.openSubMenuId() === itemId;
  }
} 