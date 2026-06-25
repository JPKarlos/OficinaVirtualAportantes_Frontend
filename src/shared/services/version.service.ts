import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_STORAGE_KEYS } from '../../core/constants/app-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private versionUrl = '/assets/version.json';

  constructor(private http: HttpClient) {}

  public currentVersion = signal<string>('');

  checkVersion(): void {
    this.http.get<{ version: string }>(this.versionUrl).subscribe(response => {
      const currentVersion = response.version;
      const storedVersion = localStorage.getItem(APP_STORAGE_KEYS.version);
      this.currentVersion.set(currentVersion);
      if (storedVersion !== currentVersion) {
        console.log('Nueva versión detectada:', currentVersion);
        localStorage.setItem(APP_STORAGE_KEYS.version, currentVersion);
        window.location.reload();
      }
    });
  }
}
