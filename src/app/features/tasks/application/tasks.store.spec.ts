import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppError } from '@core/errors/app-error';
import { Observable, take, throwError } from 'rxjs';
import { Task } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { provideTasks } from '../tasks.providers';
import { TasksStore } from './tasks.store';

describe('TasksStore', () => {
  let errorHandler: jasmine.SpyObj<ErrorHandler>;

  beforeEach(() => {
    errorHandler = jasmine.createSpyObj<ErrorHandler>('ErrorHandler', ['handleError']);
  });

  /** Reads the value a store observable holds right now. */
  function current<T>(source: Observable<T>): T {
    let value!: T;
    source.pipe(take(1)).subscribe((emitted) => (value = emitted));
    return value;
  }

  function reportedErrors(): AppError[] {
    return errorHandler.handleError.calls.allArgs().map(([error]) => error as AppError);
  }

  describe('with the in-memory repository', () => {
    let store: TasksStore;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideTasks(), { provide: ErrorHandler, useValue: errorHandler }]
      });
      store = TestBed.inject(TasksStore);
    });

    it('starts without tasks', () => {
      expect(current(store.tasks$)).toEqual([]);
      expect(current(store.remaining$)).toBe(0);
    });

    it('adds a trimmed task', () => {
      store.add('  buy milk  ');

      expect(current(store.tasks$).map((task) => task.title)).toEqual(['buy milk']);
      expect(current(store.remaining$)).toBe(1);
    });

    it('reports a validation error for an invalid title and keeps the state', () => {
      store.add('   ');

      expect(current(store.tasks$)).toEqual([]);
      expect(reportedErrors().map((error) => error.kind)).toEqual(['validation']);
    });

    it('toggles a task and updates the remaining counter', () => {
      store.add('buy milk');
      const [task] = current(store.tasks$);

      store.toggle(task.id);
      expect(current(store.tasks$)[0].done).toBeTrue();
      expect(current(store.remaining$)).toBe(0);

      store.toggle(task.id);
      expect(current(store.tasks$)[0].done).toBeFalse();
      expect(current(store.remaining$)).toBe(1);
    });

    it('removes a task', () => {
      store.add('buy milk');
      const [task] = current(store.tasks$);

      store.remove(task.id);

      expect(current(store.tasks$)).toEqual([]);
      expect(errorHandler.handleError).not.toHaveBeenCalled();
    });

    it('reports a not-found error when removing a task that does not exist', () => {
      store.remove('missing');

      expect(reportedErrors().map((error) => error.kind)).toEqual(['not-found']);
    });
  });

  describe('with a failing repository', () => {
    class FailingTaskRepository extends TaskRepository {
      list(): Observable<readonly Task[]> {
        return throwError(() => new Error('storage offline'));
      }
      add(): Observable<Task> {
        return throwError(() => new Error('storage offline'));
      }
      setDone(): Observable<Task> {
        return throwError(() => new Error('storage offline'));
      }
      remove(): Observable<void> {
        return throwError(() => new Error('storage offline'));
      }
    }

    let store: TasksStore;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          TasksStore,
          { provide: TaskRepository, useClass: FailingTaskRepository },
          { provide: ErrorHandler, useValue: errorHandler }
        ]
      });
      store = TestBed.inject(TasksStore);
    });

    it('reports the failure of the initial load and stays empty', () => {
      expect(current(store.tasks$)).toEqual([]);
      expect(reportedErrors().map((error) => error.kind)).toEqual(['unexpected']);
    });

    it('reports the failure of an add and does not change the state', () => {
      errorHandler.handleError.calls.reset();

      store.add('buy milk');

      expect(current(store.tasks$)).toEqual([]);
      expect(reportedErrors().map((error) => error.kind)).toEqual(['unexpected']);
    });
  });
});
