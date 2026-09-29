import { ErrorHandler, Injectable, Provider, inject } from '@angular/core';
import { Logger } from '@core/logging/logger';
import { toAppError } from './app-error';
import { ErrorNotifier } from './error-notifier';

/**
 * Single sink for every error: the ones features report on purpose and the ones
 * Angular catches in templates, event handlers and change detection.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifier = inject(ErrorNotifier);
  private readonly logger = inject(Logger);

  handleError(error: unknown): void {
    const appError = toAppError(error);
    if (appError.kind === 'unexpected') {
      this.logger.error('Unexpected error', {
        errorId: appError.id,
        cause: appError.cause ?? appError
      });
    } else {
      this.logger.info('Handled error', {
        errorId: appError.id,
        kind: appError.kind,
        message: appError.userMessage
      });
    }
    this.notifier.report(appError);
  }
}

export function provideErrorHandling(): Provider[] {
  return [{ provide: ErrorHandler, useClass: GlobalErrorHandler }];
}
