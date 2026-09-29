import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Logger } from '@core/logging/logger';
import { AppError, UNEXPECTED_ERROR_MESSAGE } from './app-error';
import { ErrorNotifier } from './error-notifier';
import { provideErrorHandling } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: ErrorHandler;
  let notifier: ErrorNotifier;
  let logger: jasmine.SpyObj<Logger>;

  beforeEach(() => {
    logger = jasmine.createSpyObj<Logger>('Logger', ['debug', 'info', 'warn', 'error']);
    TestBed.configureTestingModule({
      providers: [provideErrorHandling(), { provide: Logger, useValue: logger }]
    });
    handler = TestBed.inject(ErrorHandler);
    notifier = TestBed.inject(ErrorNotifier);
  });

  it('shows expected errors and logs them at info level', () => {
    handler.handleError(new AppError('validation', 'Title is required'));

    expect(notifier.notifications().map((n) => n.error.userMessage)).toEqual(['Title is required']);
    expect(logger.info).toHaveBeenCalledOnceWith('Handled error', {
      errorId: jasmine.stringMatching(/^[a-z0-9]{8}$/),
      kind: 'validation',
      message: 'Title is required'
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs the original cause of unexpected errors and shows a generic message', () => {
    const cause = new Error('boom');

    handler.handleError(cause);

    const shown = notifier.notifications()[0].error;
    expect(shown.userMessage).toBe(UNEXPECTED_ERROR_MESSAGE);
    expect(logger.error).toHaveBeenCalledOnceWith('Unexpected error', { errorId: shown.id, cause });
  });
});
