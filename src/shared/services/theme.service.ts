import { Injectable, signal } from '@angular/core';
import { APP_STORAGE_KEYS } from '../../core/constants/app-storage-keys';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = APP_STORAGE_KEYS.theme;
  
  // Signal para el tema actual
  public currentTheme = signal<Theme>('light');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Obtener tema guardado o usar preferencia del sistema
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const systemTheme = this.getSystemTheme();
    
    const theme = savedTheme || systemTheme;
    this.setTheme(theme);
  }

  private getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  public setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    
    // Aplicar tema al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar en localStorage
    localStorage.setItem(this.THEME_KEY, theme);
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
} 