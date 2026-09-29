import { Observable, defer, retry, throwError, timeout, timer } from 'rxjs';
import { InvalidTaskTitleError, Task, TaskNotFoundError } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';

export interface ResiliencePolicy {
  /** How many times a failed call is repeated after the first attempt. */
  readonly retries: number;
  /** Wait before the first retry; it doubles on every following retry. */
  readonly baseDelayMs: number;
  /** How long a single attempt may take before it counts as a failure. */
  readonly timeoutMs: number;
}

export const DEFAULT_RESILIENCE_POLICY: ResiliencePolicy = {
  retries: 2,
  baseDelayMs: 200,
  timeoutMs: 5000
};

/** Answers that will not change if the call is repeated, so retrying only wastes time. */
function isDefinitive(error: unknown): boolean {
  return error instanceof TaskNotFoundError || error instanceof InvalidTaskTitleError;
}

/**
 * Wraps any repository with a time limit per attempt and retries with exponential backoff.
 * `add` is never repeated: it is not idempotent, so a retry after a lost response could
 * create the same task twice.
 */
export class ResilientTaskRepository extends TaskRepository {
  constructor(
    private readonly inner: TaskRepository,
    private readonly policy: ResiliencePolicy = DEFAULT_RESILIENCE_POLICY
  ) {
    super();
  }

  list(): Observable<readonly Task[]> {
    return this.withRetries(() => this.inner.list());
  }

  add(title: string): Observable<Task> {
    return this.withTimeout(() => this.inner.add(title));
  }

  setDone(id: string, done: boolean): Observable<Task> {
    return this.withRetries(() => this.inner.setDone(id, done));
  }

  remove(id: string): Observable<void> {
    return this.withRetries(() => this.inner.remove(id));
  }

  private withTimeout<T>(call: () => Observable<T>): Observable<T> {
    return defer(call).pipe(timeout(this.policy.timeoutMs));
  }

  private withRetries<T>(call: () => Observable<T>): Observable<T> {
    return this.withTimeout(call).pipe(
      retry({
        count: this.policy.retries,
        delay: (error: unknown, retryCount: number) =>
          isDefinitive(error)
            ? throwError(() => error)
            : timer(this.policy.baseDelayMs * 2 ** (retryCount - 1))
      })
    );
  }
}
