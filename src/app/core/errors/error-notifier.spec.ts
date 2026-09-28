import { TestBed } from '@angular/core/testing';
import { AppError } from './app-error';
import { ErrorNotifier, MAX_VISIBLE_NOTIFICATIONS } from './error-notifier';

describe('ErrorNotifier', () => {
  let notifier: ErrorNotifier;

  beforeEach(() => {
    notifier = TestBed.inject(ErrorNotifier);
  });

  it('keeps reported errors in order', () => {
    notifier.report(new AppError('validation', 'first'));
    notifier.report(new AppError('not-found', 'second'));

    expect(notifier.notifications().map((n) => n.error.userMessage)).toEqual(['first', 'second']);
  });

  it('dismisses a single notification', () => {
    notifier.report(new AppError('validation', 'first'));
    notifier.report(new AppError('validation', 'second'));
    const [first] = notifier.notifications();

    notifier.dismiss(first.id);

    expect(notifier.notifications().map((n) => n.error.userMessage)).toEqual(['second']);
  });

  it('only keeps the most recent notifications', () => {
    for (let i = 1; i <= MAX_VISIBLE_NOTIFICATIONS + 2; i++) {
      notifier.report(new AppError('unexpected', `error ${i}`));
    }

    const messages = notifier.notifications().map((n) => n.error.userMessage);
    expect(messages.length).toBe(MAX_VISIBLE_NOTIFICATIONS);
    expect(messages[messages.length - 1]).toBe(`error ${MAX_VISIBLE_NOTIFICATIONS + 2}`);
  });
});
