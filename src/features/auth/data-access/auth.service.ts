import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { ActualizacionAportanteStatus } from '../interfaces/actualizacion-aportante-status.interface';
import { catchError, map, Observable, of, firstValueFrom } from 'rxjs';
import { throwError } from 'rxjs';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { CheckTokenResponse } from '../interfaces/check-token.response';
import { NavigationService } from '../../../core/services/navigation.service';
import { AportanteValidationService } from './aportante-validation.service';
import { APP_STORAGE_KEYS } from '../../../core/constants/app-storage-keys';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ResetPasswordCredentials {
  username: string;
  email: string;
}

export interface ResetPasswordWithTokenCredentials {
  token: string;
  newPassword: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static readonly ESTADO_ACTUALIZACION_KEY = APP_STORAGE_KEYS.estadoActualizacion;

  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly validationService = inject(AportanteValidationService);

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  #currentUser = signal<User | null>(null);
  #authStatus = signal<AuthStatus>(AuthStatus.checking);
  #estadoActualizacion = signal<ActualizacionAportanteStatus | null>(null);

  public currentUser = computed(() => this.#currentUser());
  public authStatus = computed(() => this.#authStatus());
  public estadoActualizacion = computed(() => this.#estadoActualizacion());

  // Signals para el estado de autenticación
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor() {
    this.restoreSessionFromStorage();
    this.checkAuthStatus();
  }

  private restoreSessionFromStorage(): void {
    const token = localStorage.getItem(APP_STORAGE_KEYS.token);
    const storedUser = localStorage.getItem(APP_STORAGE_KEYS.user);

    if (token && storedUser) {
      try {
        this.#currentUser.set(JSON.parse(storedUser) as User);
        this.#authStatus.set(AuthStatus.authenticated);
      } catch {
        this.#currentUser.set(null);
      }
    }

    this.restoreEstadoActualizacionFromStorage();

    if (this.#estadoActualizacion()) {
      this.syncValidationMessage(this.#estadoActualizacion());
    }
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-status`;
    const token = localStorage.getItem(APP_STORAGE_KEYS.token) || null;
    const userLocalStorage = localStorage.getItem(APP_STORAGE_KEYS.user);

    if (!token) {
      this.#authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    // Si hay token, verificar si es válido
    return this.http.get<CheckTokenResponse>(url).pipe(
      map(({ user, token }) => {
        this.setAuthentication(user, token);
        return true;
      }),
      catchError((err) => {
        // Solo si el token no es válido, limpiar y redirigir al login
        this.logout(false); // No limpiar la ruta para mantener la navegación
        this.#authStatus.set(AuthStatus.notAuthenticated);
        return of(false);
      })
    );
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    const url = `${this.baseUrl}/auth/login`;
    const body = {
      username: credentials.username,
      password: credentials.password,
    };

    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(url, body)
      );
      this.setAuthentication(
        response.user,
        response.token,
        response.estadoActualizacion,
      );
      this.syncValidationMessage(response.estadoActualizacion);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error de autenticación';
      return { success: false, error: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  private setAuthentication(
    user: User,
    token: string,
    estadoActualizacion?: ActualizacionAportanteStatus,
  ): boolean {
    this.#currentUser.set(user);
    this.#authStatus.set(AuthStatus.authenticated);
    localStorage.setItem(APP_STORAGE_KEYS.token, token);
    localStorage.setItem(APP_STORAGE_KEYS.user, JSON.stringify(user));

    if (estadoActualizacion !== undefined) {
      this.persistEstadoActualizacion(estadoActualizacion);
    } else {
      this.restoreEstadoActualizacionFromStorage();
    }

    return true;
  }

  async ensureEstadoActualizacion(): Promise<ActualizacionAportanteStatus | null> {
    const currentEstado = this.#estadoActualizacion();
    if (currentEstado) {
      this.syncValidationMessage(currentEstado);
      return currentEstado;
    }

    const user = this.#currentUser();
    const aportanteId = user?.Aportante_id ?? this.getAportanteIdFromStorage();

    const resolvedEstado =
      await this.validationService.resolveEstadoActualizacion(aportanteId);

    if (resolvedEstado) {
      this.persistEstadoActualizacion(resolvedEstado);
      this.syncValidationMessage(resolvedEstado);
    }

    return resolvedEstado;
  }

  private getAportanteIdFromStorage(): number | null {
    const storedUser = localStorage.getItem(APP_STORAGE_KEYS.user);
    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser) as User;
      return user.Aportante_id ?? null;
    } catch {
      return null;
    }
  }

  private syncValidationMessage(
    estado: ActualizacionAportanteStatus | null | undefined,
  ): void {
    this.validationService.applyEstadoActualizacion(estado ?? null);
  }

  getEstadoActualizacion(): ActualizacionAportanteStatus | null {
    return this.#estadoActualizacion();
  }

  updateSessionAfterAportanteCreated(
    aportanteId: number,
    estadoActualizacion: ActualizacionAportanteStatus,
  ): void {
    const currentUser = this.#currentUser();
    const token = localStorage.getItem(APP_STORAGE_KEYS.token);

    if (!currentUser || !token) {
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      Aportante_id: aportanteId,
    };

    this.setAuthentication(updatedUser, token, estadoActualizacion);
    this.syncValidationMessage(estadoActualizacion);
  }

  private persistEstadoActualizacion(
    estado: ActualizacionAportanteStatus | null,
  ): void {
    this.#estadoActualizacion.set(estado);

    if (!estado) {
      localStorage.removeItem(AuthService.ESTADO_ACTUALIZACION_KEY);
      return;
    }

    localStorage.setItem(
      AuthService.ESTADO_ACTUALIZACION_KEY,
      JSON.stringify(estado),
    );
  }

  private restoreEstadoActualizacionFromStorage(): void {
    const stored = localStorage.getItem(AuthService.ESTADO_ACTUALIZACION_KEY);
    if (!stored) {
      this.#estadoActualizacion.set(null);
      return;
    }

    try {
      this.#estadoActualizacion.set(JSON.parse(stored) as ActualizacionAportanteStatus);
    } catch {
      this.#estadoActualizacion.set(null);
      localStorage.removeItem(AuthService.ESTADO_ACTUALIZACION_KEY);
    }
  }

  logout(clearRoute: boolean = true): void {
    if (clearRoute && this.router.url !== '/auth/login') {
      this.navigationService.clearSavedRoute();
    }
    localStorage.removeItem(APP_STORAGE_KEYS.token);
    localStorage.removeItem(APP_STORAGE_KEYS.user);
    localStorage.removeItem(AuthService.ESTADO_ACTUALIZACION_KEY);
    this.#currentUser.set(null);
    this.#estadoActualizacion.set(null);
    this.validationService.clearValidationResult();
    this.#authStatus.set(AuthStatus.notAuthenticated);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): User | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  async passwordRestore(credentials: ResetPasswordCredentials): Promise<{ success: boolean; error?: string }> {
    const url = `${this.baseUrl}/auth/password-restore`;
    const body = {
      username: credentials.username,
      email: credentials.email,
    };

    this.isLoading.set(true);

    try {
      await firstValueFrom(this.http.post(url, body));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al enviar el enlace de restauración';
      return { success: false, error: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetPassword(credentials: ResetPasswordWithTokenCredentials): Promise<{ success: boolean; error?: string }> {
    const url = `${this.baseUrl}/auth/reset-password`;
    const body = {
      token: credentials.token,
      newPassword: credentials.newPassword,
    };

    this.isLoading.set(true);

    try {
      await firstValueFrom(this.http.post(url, body));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al restablecer la contraseña';
      return { success: false, error: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  async changePassword(credentials: ChangePasswordCredentials): Promise<{ success: boolean; error?: string }> {
    const url = `${this.baseUrl}/auth/change-password`;
    const body = {
      currentPassword: credentials.currentPassword,
      newPassword: credentials.newPassword,
    };

    this.isLoading.set(true);

    try {
      await firstValueFrom(this.http.post(url, body));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al cambiar la contraseña';
      return { success: false, error: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }
}
