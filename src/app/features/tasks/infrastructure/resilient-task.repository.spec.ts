import { fakeAsync, tick } from '@angular/core/testing';
import { Observable, TimeoutError, map, of, throwError, timer } from 'rxjs';
import { Task, TaskNotFoundError } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { ResiliencePolicy, ResilientTaskRepository } from './resilient-task.repository';

const POLICY: ResiliencePolicy = { retries: 2, baseDelayMs: 100, timeoutMs: 1000 };
const TASK: Task = { id: '1', title: 'buy milk', done: false };

/** Repository whose calls fail a given number of times before succeeding. */
class FlakyRepository extends TaskRepository {
  calls = 0;

  constructor(
    private readonly failures: number,
    private readonly failure: () => Error = () => new Error('network down')
  ) {
    super();
  }

  list(): Observable<readonly Task[]> {
    return this.attempt(() => of([TASK]));
  }
  add(): Observable<Task> {
    return this.attempt(() => of(TASK));
  }
  setDone(): Observable<Task> {
    return this.attempt(() => of(TASK));
  }
  remove(): Observable<void> {
    return this.attempt(() => of(undefined));
  }

  private attempt<T>(success: () => Observable<T>): Observable<T> {
    this.calls++;
    return this.calls <= this.failures ? throwError(this.failure) : success();
  }
}

describe('ResilientTaskRepository', () => {
  function run<T>(source: Observable<T>): { value?: T; error?: unknown } {
    const outcome: { value?: T; error?: unknown } = {};
    source.subscribe({
      next: (value) => (outcome.value = value),
      error: (error: unknown) => (outcome.error = error)
    });
    return outcome;
  }

  it('returns the result without delay when the call works', fakeAsync(() => {
    const inner = new FlakyRepository(0);

    const outcome = run(new ResilientTaskRepository(inner, POLICY).list());

    expect(outcome.value).toEqual([TASK]);
    expect(inner.calls).toBe(1);
  }));

  it('retries a failing read with exponential backoff until it works', fakeAsync(() => {
    const inner = new FlakyRepository(2);

    const outcome = run(new ResilientTaskRepository(inner, POLICY).list());
    expect(inner.calls).toBe(1);

    tick(99);
    expect(inner.calls).toBe(1);
    tick(1);
    expect(inner.calls).toBe(2);

    tick(199);
    expect(inner.calls).toBe(2);
    tick(1);
    expect(inner.calls).toBe(3);
    expect(outcome.value).toEqual([TASK]);
  }));

  it('gives up after the configured number of retries and surfaces the last error', fakeAsync(() => {
    const inner = new FlakyRepository(Infinity);

    const outcome = run(new ResilientTaskRepository(inner, POLICY).setDone('1', true));
    tick(1000);

    expect(inner.calls).toBe(3);
    expect(outcome.error).toEqual(new Error('network down'));
  }));

  it('does not retry an add, which is not idempotent', fakeAsync(() => {
    const inner = new FlakyRepository(1);

    const outcome = run(new ResilientTaskRepository(inner, POLICY).add('buy milk'));
    tick(1000);

    expect(inner.calls).toBe(1);
    expect(outcome.error).toEqual(new Error('network down'));
  }));

  it('does not retry an answer that cannot change', fakeAsync(() => {
    const inner = new FlakyRepository(Infinity, () => new TaskNotFoundError('9'));

    const outcome = run(new ResilientTaskRepository(inner, POLICY).remove('9'));
    tick(1000);

    expect(inner.calls).toBe(1);
    expect(outcome.error).toBeInstanceOf(TaskNotFoundError);
  }));

  it('fails a call that takes longer than the time limit', fakeAsync(() => {
    const slow = new (class extends FlakyRepository {
      override list(): Observable<readonly Task[]> {
        this.calls++;
        return timer(5000).pipe(map((): readonly Task[] => [TASK]));
      }
    })(0);
    const repository = new ResilientTaskRepository(slow, { ...POLICY, retries: 0 });

    const outcome = run(repository.list());
    tick(999);
    expect(outcome.error).toBeUndefined();
    tick(1);

    expect(outcome.error).toBeInstanceOf(TimeoutError);
  }));
});
