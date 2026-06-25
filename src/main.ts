import { bootstrapApplication } from '@angular/platform-browser';
import { migrateLegacyAppStorageKeys } from './core/constants/app-storage-keys';
import { appConfig } from './app/app.config';
import { App } from './app/app';

migrateLegacyAppStorageKeys();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
