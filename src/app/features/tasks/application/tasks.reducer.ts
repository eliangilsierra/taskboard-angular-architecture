import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Task } from '../domain/task';
import { tasksActions } from './tasks.actions';

export interface TasksState {
  readonly tasks: readonly Task[];
}

export const initialTasksState: TasksState = { tasks: [] };

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: createReducer(
    initialTasksState,
    on(tasksActions.loaded, (state, { tasks }): TasksState => ({ ...state, tasks })),
    on(tasksActions.added, (state, { task }): TasksState => ({
      ...state,
      tasks: [...state.tasks, task]
    })),
    on(tasksActions.toggled, (state, { task }): TasksState => ({
      ...state,
      tasks: state.tasks.map((current) => (current.id === task.id ? task : current))
    })),
    on(tasksActions.removed, (state, { id }): TasksState => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== id)
    }))
  ),
  extraSelectors: ({ selectTasks }) => ({
    selectRemaining: createSelector(
      selectTasks,
      (tasks) => tasks.filter((task) => !task.done).length
    )
  })
});
