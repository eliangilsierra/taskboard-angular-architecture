import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppError, UNEXPECTED_ERROR_MESSAGE } from './app-error';
import { ErrorNotifier } from './error-notifier';
import { provideErrorHandling } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: ErrorHandler;
  let notifier: ErrorNotifier;
  let consoleError: jasmine.Spy;

  beforeEach(() => {
    consoleError = spyOn(console, 'error');
    TestBed.configureTestingModule({ providers: provideErrorHandling() });
    handler = TestBed.inject(ErrorHandler);
    notifier = TestBed.inject(ErrorNotifier);
  });

  it('shows expected errors without logging them', () => {
    handler.handleError(new AppError('validation', 'Title is required'));

    expect(notifier.notifications().map((n) => n.error.userMessage)).toEqual(['Title is required']);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('logs the original cause of unexpected errors and shows a generic message', () => {
    const cause = new Error('boom');

    handler.handleError(cause);

    expect(consoleError).toHaveBeenCalledOnceWith(cause);
    expect(notifier.notifications()[0].error.userMessage).toBe(UNEXPECTED_ERROR_MESSAGE);
  });
});
