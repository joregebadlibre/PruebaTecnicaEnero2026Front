import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { apiErrorInterceptor } from './core/api/api-error.interceptor';
import { API_CONFIG } from './core/api/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    {
      provide: API_CONFIG,
      useValue: { baseUrl: environment.apiBaseUrl },
    },
  ]
};
