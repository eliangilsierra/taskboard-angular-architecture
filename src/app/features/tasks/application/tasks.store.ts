import { ErrorHandler, computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Observable } from 'rxjs';
import { Task, normalizeTitle } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { toTaskAppError } from './task-errors';

interface TasksState {
  readonly tasks: readonly Task[];
}

/** Holds the state of the task board and orchestrates the use cases. */
export const TasksStore = signalStore(
  withState<TasksState>({ tasks: [] }),
  withComputed(({ tasks }) => ({
    remaining: computed(() => tasks().filter((task) => !task.done).length)
  })),
  withMethods((store, repository = inject(TaskRepository), errorHandler = inject(ErrorHandler)) => {
    /** Subscribes to a repository call and sends any failure to the global error handler. */
    const run = <T>(source: Observable<T>, onSuccess: (value: T) => void): void => {
      source.subscribe({
        next: onSuccess,
        error: (error: unknown) => errorHandler.handleError(toTaskAppError(error))
      });
    };

    return {
      _load(): void {
        run(repository.list(), (tasks) => patchState(store, { tasks }));
      },

      add(title: string): void {
        let normalized: string;
        try {
          normalized = normalizeTitle(title);
        } catch (error) {
          errorHandler.handleError(toTaskAppError(error));
          return;
        }
        run(repository.add(normalized), (task) => {
          patchState(store, (state) => ({ tasks: [...state.tasks, task] }));
        });
      },

      toggle(id: string): void {
        const current = store.tasks().find((task) => task.id === id);
        if (!current) {
          return;
        }
        run(repository.setDone(id, !current.done), (updated) => {
          patchState(store, (state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? updated : task))
          }));
        });
      },

      remove(id: string): void {
        run(repository.remove(id), () => {
          patchState(store, (state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
        });
      }
    };
  }),
  withHooks({
    onInit: (store) => store._load()
  })
);

export type TasksStore = InstanceType<typeof TasksStore>;
