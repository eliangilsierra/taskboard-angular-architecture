import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Task, TaskNotFoundError } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';

@Injectable()
export class InMemoryTaskRepository extends TaskRepository {
  private tasks: readonly Task[] = [];
  private nextId = 1;

  list(): Observable<readonly Task[]> {
    return of(this.tasks);
  }

  add(title: string): Observable<Task> {
    const task: Task = { id: String(this.nextId++), title, done: false };
    this.tasks = [...this.tasks, task];
    return of(task);
  }

  setDone(id: string, done: boolean): Observable<Task> {
    const current = this.tasks.find((task) => task.id === id);
    if (!current) {
      return throwError(() => new TaskNotFoundError(id));
    }
    const updated: Task = { ...current, done };
    this.tasks = this.tasks.map((task) => (task.id === id ? updated : task));
    return of(updated);
  }

  remove(id: string): Observable<void> {
    if (!this.tasks.some((task) => task.id === id)) {
      return throwError(() => new TaskNotFoundError(id));
    }
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return of(undefined);
  }
}
