import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import SidebarComponent from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './layout.component.html'
})
export default class LayoutComponent {
  pageTitle = input<string>('Aplicación');
  isMobileMenuOpen = input<boolean>(false);
  
  menuItems = input([
       
    {
      id: 'change-password',
      title: 'Cambiar Contraseña',
      icon: 'key',
      route: '/auth/change-password'
    }
  ]);

  toggleMobileMenu() {
    // This would typically use a signal or emit an event
    console.log('Toggle mobile menu from layout');
  }
} 