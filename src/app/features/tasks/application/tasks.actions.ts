import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task } from '../domain/task';

export const tasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    Load: emptyProps(),
    Loaded: props<{ tasks: readonly Task[] }>(),
    Add: props<{ title: string }>(),
    Added: props<{ task: Task }>(),
    Toggle: props<{ id: string; done: boolean }>(),
    Toggled: props<{ task: Task }>(),
    Remove: props<{ id: string }>(),
    Removed: props<{ id: string }>(),
    Failed: props<{ error: unknown }>()
  }
});
