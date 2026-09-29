import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAppConfig } from '@core/config/app-config';
import { provideErrorHandling } from '@core/errors/global-error-handler';
import { environment } from '@env/environment';
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAppConfig(environment),
    provideErrorHandling(),
    provideStore()
  ]
};
