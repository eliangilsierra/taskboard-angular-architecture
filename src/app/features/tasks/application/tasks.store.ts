import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { tasksActions } from './tasks.actions';
import { tasksFeature } from './tasks.reducer';

/** Facade over the NgRx store: the rest of the feature never sees actions or selectors. */
@Injectable()
export class TasksStore {
  private readonly store = inject(Store);

  readonly tasks = this.store.selectSignal(tasksFeature.selectTasks);
  readonly remaining = this.store.selectSignal(tasksFeature.selectRemaining);

  constructor() {
    this.store.dispatch(tasksActions.load());
  }

  add(title: string): void {
    this.store.dispatch(tasksActions.add({ title }));
  }

  toggle(id: string): void {
    const current = this.tasks().find((task) => task.id === id);
    if (current) {
      this.store.dispatch(tasksActions.toggle({ id, done: !current.done }));
    }
  }

  remove(id: string): void {
    this.store.dispatch(tasksActions.remove({ id }));
  }
}
