import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Task } from '../domain/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  readonly tasks = input.required<readonly Task[]>();
  readonly toggled = output<string>();
  readonly removed = output<string>();
}
