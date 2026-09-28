import { ErrorHandler, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { Task, normalizeTitle } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { toTaskAppError } from './task-errors';

/** Holds the state of the task board and orchestrates the use cases. */
@Injectable()
export class TasksStore {
  private readonly repository = inject(TaskRepository);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly state$ = new BehaviorSubject<readonly Task[]>([]);

  readonly tasks$ = this.state$.asObservable();
  readonly remaining$ = this.state$.pipe(
    map((tasks) => tasks.filter((task) => !task.done).length),
    distinctUntilChanged()
  );

  constructor() {
    this.run(this.repository.list(), (tasks) => this.state$.next(tasks));
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
      this.state$.next([...this.state$.value, task]);
    });
  }

  toggle(id: string): void {
    const current = this.state$.value.find((task) => task.id === id);
    if (!current) {
      return;
    }
    this.run(this.repository.setDone(id, !current.done), (updated) => {
      this.state$.next(this.state$.value.map((task) => (task.id === id ? updated : task)));
    });
  }

  remove(id: string): void {
    this.run(this.repository.remove(id), () => {
      this.state$.next(this.state$.value.filter((task) => task.id !== id));
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
