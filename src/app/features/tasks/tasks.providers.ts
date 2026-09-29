import { EnvironmentProviders, Provider } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { tasksEffects } from './application/tasks.effects';
import { tasksFeature } from './application/tasks.reducer';
import { TasksStore } from './application/tasks.store';
import { TaskRepository } from './domain/task.repository';
import { InMemoryTaskRepository } from './infrastructure/in-memory-task.repository';

/**
 * Composition root of the feature: the only place that binds ports to adapters.
 * Requires `provideStore()` to be registered at the application level.
 */
export function provideTasks(): (Provider | EnvironmentProviders)[] {
  return [
    TasksStore,
    { provide: TaskRepository, useClass: InMemoryTaskRepository },
    provideState(tasksFeature),
    provideEffects(tasksEffects)
  ];
}
