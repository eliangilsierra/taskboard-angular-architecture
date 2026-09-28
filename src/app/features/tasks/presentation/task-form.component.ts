import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { MAX_TASK_TITLE_LENGTH, isValidTitle } from '../domain/task';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent {
  readonly submitted = output<string>();

  protected readonly maxLength = MAX_TASK_TITLE_LENGTH;
  protected readonly title = signal('');
  protected readonly canSubmit = computed(() => isValidTitle(this.title()));

  protected onInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    this.submitted.emit(this.title());
    this.title.set('');
  }
}
