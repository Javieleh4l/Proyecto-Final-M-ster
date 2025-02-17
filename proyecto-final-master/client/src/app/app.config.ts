// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routing'; // Importa desde app.routing

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
