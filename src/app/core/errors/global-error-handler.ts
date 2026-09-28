import { ErrorHandler, Injectable, Provider, inject } from '@angular/core';
import { toAppError } from './app-error';
import { ErrorNotifier } from './error-notifier';

/**
 * Single sink for every error: the ones features report on purpose and the ones
 * Angular catches in templates, event handlers and change detection.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifier = inject(ErrorNotifier);

  handleError(error: unknown): void {
    const appError = toAppError(error);
    if (appError.kind === 'unexpected') {
      console.error(appError.cause ?? appError);
    }
    this.notifier.report(appError);
  }
}

export function provideErrorHandling(): Provider[] {
  return [{ provide: ErrorHandler, useClass: GlobalErrorHandler }];
}
