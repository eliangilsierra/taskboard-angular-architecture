import { TestBed } from '@angular/core/testing';
import { AppError } from './app-error';
import { ErrorBannerComponent } from './error-banner.component';
import { ErrorNotifier } from './error-notifier';

describe('ErrorBannerComponent', () => {
  it('shows reported errors and lets the user dismiss them', () => {
    const fixture = TestBed.createComponent(ErrorBannerComponent);
    const notifier = TestBed.inject(ErrorNotifier);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();

    notifier.report(new AppError('not-found', 'That task no longer exists.'));
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'That task no longer exists.'
    );

    element.querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows the reference of unexpected errors only', () => {
    const fixture = TestBed.createComponent(ErrorBannerComponent);
    const notifier = TestBed.inject(ErrorNotifier);
    const element = fixture.nativeElement as HTMLElement;
    const unexpected = new AppError('unexpected', 'Something went wrong.');

    notifier.report(new AppError('validation', 'Title is required'));
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Reference');

    notifier.report(unexpected);
    fixture.detectChanges();
    expect(element.textContent).toContain(`Reference: ${unexpected.id}`);
  });
});
