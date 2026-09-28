import { Injectable, signal } from '@angular/core';
import { AppError } from './app-error';

export const MAX_VISIBLE_NOTIFICATIONS = 3;

export interface ErrorNotification {
  readonly id: number;
  readonly error: AppError;
}

/** Keeps the errors that are currently shown to the user. */
@Injectable({ providedIn: 'root' })
export class ErrorNotifier {
  private nextId = 1;
  private readonly state = signal<readonly ErrorNotification[]>([]);

  readonly notifications = this.state.asReadonly();

  report(error: AppError): void {
    const notification: ErrorNotification = { id: this.nextId++, error };
    this.state.update((current) => [...current, notification].slice(-MAX_VISIBLE_NOTIFICATIONS));
  }

  dismiss(id: number): void {
    this.state.update((current) => current.filter((notification) => notification.id !== id));
  }
}
