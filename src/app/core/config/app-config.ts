import { InjectionToken, Provider } from '@angular/core';
import type { LogLevel } from '@core/logging/logger';

export interface AppConfig {
  readonly appName: string;
  readonly production: boolean;
  readonly logLevel: LogLevel;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(config: AppConfig): Provider {
  return { provide: APP_CONFIG, useValue: config };
}
