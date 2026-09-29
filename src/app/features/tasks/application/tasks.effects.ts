import { ErrorHandler, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, catchError, concatMap, defer, exhaustMap, map, of, tap } from 'rxjs';
import { normalizeTitle } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { tasksActions } from './tasks.actions';
import { toTaskAppError } from './task-errors';

type TasksAction = ReturnType<(typeof tasksActions)[keyof typeof tasksActions]>;

/** Turns the outcome of a repository call into an action; any failure becomes `failed`. */
function attempt(call: () => Observable<TasksAction>): Observable<TasksAction> {
  return defer(call).pipe(catchError((error: unknown) => of(tasksActions.failed({ error }))));
}

const loadTasks = createEffect(
  (actions$ = inject(Actions), repository = inject(TaskRepository)) =>
    actions$.pipe(
      ofType(tasksActions.load),
      exhaustMap(() =>
        attempt(() => repository.list().pipe(map((tasks) => tasksActions.loaded({ tasks }))))
      )
    ),
  { functional: true }
);

const addTask = createEffect(
  (actions$ = inject(Actions), repository = inject(TaskRepository)) =>
    actions$.pipe(
      ofType(tasksActions.add),
      concatMap(({ title }) =>
        attempt(() =>
          repository.add(normalizeTitle(title)).pipe(map((task) => tasksActions.added({ task })))
        )
      )
    ),
  { functional: true }
);

const toggleTask = createEffect(
  (actions$ = inject(Actions), repository = inject(TaskRepository)) =>
    actions$.pipe(
      ofType(tasksActions.toggle),
      concatMap(({ id, done }) =>
        attempt(() => repository.setDone(id, done).pipe(map((task) => tasksActions.toggled({ task }))))
      )
    ),
  { functional: true }
);

const removeTask = createEffect(
  (actions$ = inject(Actions), repository = inject(TaskRepository)) =>
    actions$.pipe(
      ofType(tasksActions.remove),
      concatMap(({ id }) =>
        attempt(() => repository.remove(id).pipe(map(() => tasksActions.removed({ id }))))
      )
    ),
  { functional: true }
);

/** Sends every failure to the global error handler. */
const reportFailure = createEffect(
  (actions$ = inject(Actions), errorHandler = inject(ErrorHandler)) =>
    actions$.pipe(
      ofType(tasksActions.failed),
      tap(({ error }) => errorHandler.handleError(toTaskAppError(error)))
    ),
  { functional: true, dispatch: false }
);

export const tasksEffects = { loadTasks, addTask, toggleTask, removeTask, reportFailure };
