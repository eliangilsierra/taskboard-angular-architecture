import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorNotifier } from './error-notifier';

@Component({
  selector: 'app-error-banner',
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  protected readonly notifier = inject(ErrorNotifier);
}
