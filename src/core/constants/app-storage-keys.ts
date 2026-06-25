export const APP_NAME = 'app_oficinavirtualaportantes';

export const APP_STORAGE_KEYS = {
  token: `${APP_NAME}-token`,
  user: `${APP_NAME}-user`,
  route: `${APP_NAME}-route`,
  theme: `${APP_NAME}-theme`,
  estadoActualizacion: `${APP_NAME}-estado-actualizacion`,
  version: `${APP_NAME}-version`,
} as const;

const LEGACY_STORAGE_KEY_MAP: Record<string, string> = {
  'token-app-tutelas': APP_STORAGE_KEYS.token,
  'user-app-tutelas': APP_STORAGE_KEYS.user,
  'route-app-tutelas': APP_STORAGE_KEYS.route,
  'app-tutelas-theme': APP_STORAGE_KEYS.theme,
  'estado-actualizacion-app-tutelas': APP_STORAGE_KEYS.estadoActualizacion,
  appTutelasVersion: APP_STORAGE_KEYS.version,
};

export function migrateLegacyAppStorageKeys(): void {
  for (const [legacyKey, newKey] of Object.entries(LEGACY_STORAGE_KEY_MAP)) {
    const value = localStorage.getItem(legacyKey);
    if (value === null) {
      continue;
    }

    if (localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, value);
    }

    localStorage.removeItem(legacyKey);
  }
}
