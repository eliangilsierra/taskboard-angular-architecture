import { InjectionToken, Provider } from '@angular/core';

export interface AppConfig {
  readonly appName: string;
  readonly production: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(config: AppConfig): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
