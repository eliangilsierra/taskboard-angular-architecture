import { Observable } from 'rxjs';
import { Task } from './task';

/** Port: what the application needs from a task storage, wherever it lives. */
export abstract class TaskRepository {
  abstract list(): Observable<readonly Task[]>;
  abstract add(title: string): Observable<Task>;
  abstract setDone(id: string, done: boolean): Observable<Task>;
  abstract remove(id: string): Observable<void>;
}
