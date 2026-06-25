import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../core/interceptors/auth.interceptor';
import { NavigationService } from '../core/services/navigation.service';
import { ThemeService } from '../shared/services/theme.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation(), withViewTransitions({
      skipInitialTransition: true,
    })),
    provideHttpClient(withInterceptors([authInterceptor])),
    NavigationService,
    ThemeService
  ]
};
