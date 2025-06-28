// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NgChartsModule } from 'ng2-charts'; // <--- CORREÇÃO: Importa NgChartsModule (nome correto para o módulo)


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch() // Habilita fetch API para SSR
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideAnimations(), // Habilita animações
    importProvidersFrom(NgChartsModule) // <--- CORREÇÃO: Importa NgChartsModule, que exporta BaseChartDirective
  ]
};
