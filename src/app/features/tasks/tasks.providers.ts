import { Provider } from '@angular/core';
import { TasksStore } from './application/tasks.store';
import { TaskRepository } from './domain/task.repository';
import { InMemoryTaskRepository } from './infrastructure/in-memory-task.repository';

/** Composition root of the feature: the only place that binds ports to adapters. */
export function provideTasks(): Provider[] {
  return [TasksStore, { provide: TaskRepository, useClass: InMemoryTaskRepository }];
}
