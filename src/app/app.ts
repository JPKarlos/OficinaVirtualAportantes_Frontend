import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../features/auth/data-access/auth.service';
import { VersionService } from '../shared/services/version.service';
import { AuthStatus } from '../features/auth/interfaces/auth-status.enum';
import { APP_NAME, APP_STORAGE_KEYS } from '../core/constants/app-storage-keys';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal(APP_NAME);
  protected readonly isLoading = signal(true);

  private authService = inject(AuthService);
  private router = inject(Router);
  private versionService = inject(VersionService);

  constructor() {
    this.versionService.checkVersion();
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      await firstValueFrom(this.authService.checkAuthStatus());
      this.handleAuthNavigation();
    } catch (error) {
      // Si hay error, manejar como no autenticado
      this.handleAuthNavigation();
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleAuthNavigation() {
    switch (this.authService.authStatus()) {
      case AuthStatus.checking:
        return;

      case AuthStatus.authenticated:
        const route = localStorage.getItem(APP_STORAGE_KEYS.route) || undefined;

        if (!route) this.router.navigateByUrl('/dashboard');
        else this.router.navigateByUrl(route);

        return;

      case AuthStatus.notAuthenticated:
        if (this.router.getCurrentNavigation()?.extractedUrl.root.children["primary"]) {
          if (this.router.getCurrentNavigation()?.extractedUrl.root.children["primary"].segments[1]) {
            const subPath = this.router.getCurrentNavigation()?.extractedUrl.root.children["primary"].segments[1].path;
                               if (subPath && subPath !== 'password-restore' && subPath !== 'change-password' && !subPath.startsWith('reset-password')) {
              this.router.navigateByUrl('/auth/login');
            }
          }
          else {
            this.router.navigateByUrl('/auth/login');
          }
        } else {
          this.router.navigateByUrl('/auth/login');
        }

        return;
    }
  }
}
