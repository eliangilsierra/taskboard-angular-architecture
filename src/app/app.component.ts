import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APP_CONFIG } from '@core/config/app-config';
import { ErrorBannerComponent } from '@core/errors/error-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorBannerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly appName = inject(APP_CONFIG).appName;
}
