import { ErrorHandler, Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, normalizeTitle } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { toTaskAppError } from './task-errors';

/** Holds the state of the task board and orchestrates the use cases. */
@Injectable()
export class TasksStore {
  private readonly repository = inject(TaskRepository);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly state = signal<readonly Task[]>([]);

  readonly tasks = this.state.asReadonly();
  readonly remaining = computed(() => this.state().filter((task) => !task.done).length);

  constructor() {
    this.run(this.repository.list(), (tasks) => this.state.set(tasks));
  }

  add(title: string): void {
    let normalized: string;
    try {
      normalized = normalizeTitle(title);
    } catch (error) {
      this.errorHandler.handleError(toTaskAppError(error));
      return;
    }
    this.run(this.repository.add(normalized), (task) => {
      this.state.update((tasks) => [...tasks, task]);
    });
  }

  toggle(id: string): void {
    const current = this.state().find((task) => task.id === id);
    if (!current) {
      return;
    }
    this.run(this.repository.setDone(id, !current.done), (updated) => {
      this.state.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
    });
  }

  remove(id: string): void {
    this.run(this.repository.remove(id), () => {
      this.state.update((tasks) => tasks.filter((task) => task.id !== id));
    });
  }

  /** Subscribes to a repository call and sends any failure to the global error handler. */
  private run<T>(source: Observable<T>, onSuccess: (value: T) => void): void {
    source.subscribe({
      next: onSuccess,
      error: (error: unknown) => this.errorHandler.handleError(toTaskAppError(error))
    });
  }
}
