import { Injectable, Provider, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config/app-config';
import { LogContext, LogLevel, Logger } from './logger';

const SEVERITY: Readonly<Record<LogLevel, number>> = { debug: 0, info: 1, warn: 2, error: 3 };

/** Writes to the browser console, dropping everything below the configured level. */
@Injectable()
export class ConsoleLogger extends Logger {
  private readonly threshold = SEVERITY[inject(APP_CONFIG).logLevel];

  debug(message: string, context?: LogContext): void {
    if (this.isEnabled('debug')) {
      console.debug(message, context ?? '');
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isEnabled('info')) {
      console.info(message, context ?? '');
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isEnabled('warn')) {
      console.warn(message, context ?? '');
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.isEnabled('error')) {
      console.error(message, context ?? '');
    }
  }

  private isEnabled(level: LogLevel): boolean {
    return SEVERITY[level] >= this.threshold;
  }
}

export function provideLogging(): Provider[] {
  return [{ provide: Logger, useClass: ConsoleLogger }];
}
