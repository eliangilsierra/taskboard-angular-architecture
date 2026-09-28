import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TasksStore } from '../application/tasks.store';
import { TaskFormComponent } from './task-form.component';
import { TaskListComponent } from './task-list.component';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskFormComponent, TaskListComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksPageComponent {
  protected readonly store = inject(TasksStore);
}
