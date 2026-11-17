import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Avvia l'app Angular standalone usando la configurazione condivisa dell'applicazione.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
