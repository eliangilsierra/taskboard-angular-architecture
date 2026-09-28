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
});
