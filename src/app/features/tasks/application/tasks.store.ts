import { Injectable, computed, inject, signal } from '@angular/core';
import { Task, normalizeTitle } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';

/** Holds the state of the task board and orchestrates the use cases. */
@Injectable()
export class TasksStore {
  private readonly repository = inject(TaskRepository);
  private readonly state = signal<readonly Task[]>([]);

  readonly tasks = this.state.asReadonly();
  readonly remaining = computed(() => this.state().filter((task) => !task.done).length);

  constructor() {
    this.repository.list().subscribe((tasks) => this.state.set(tasks));
  }

  add(title: string): void {
    this.repository.add(normalizeTitle(title)).subscribe((task) => {
      this.state.update((tasks) => [...tasks, task]);
    });
  }

  toggle(id: string): void {
    const current = this.state().find((task) => task.id === id);
    if (!current) {
      return;
    }
    this.repository.setDone(id, !current.done).subscribe((updated) => {
      this.state.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
    });
  }

  remove(id: string): void {
    this.repository.remove(id).subscribe(() => {
      this.state.update((tasks) => tasks.filter((task) => task.id !== id));
    });
  }
}
