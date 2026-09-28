import { TestBed } from '@angular/core/testing';
import { InvalidTaskTitleError } from '../domain/task';
import { provideTasks } from '../tasks.providers';
import { TasksStore } from './tasks.store';

describe('TasksStore', () => {
  let store: TasksStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTasks() });
    store = TestBed.inject(TasksStore);
  });

  it('starts without tasks', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.remaining()).toBe(0);
  });

  it('adds a trimmed task', () => {
    store.add('  buy milk  ');

    expect(store.tasks().map((task) => task.title)).toEqual(['buy milk']);
    expect(store.remaining()).toBe(1);
  });

  it('rejects an invalid title', () => {
    expect(() => store.add('   ')).toThrowError(InvalidTaskTitleError);
    expect(store.tasks()).toEqual([]);
  });

  it('toggles a task and updates the remaining counter', () => {
    store.add('buy milk');
    const [task] = store.tasks();

    store.toggle(task.id);
    expect(store.tasks()[0].done).toBeTrue();
    expect(store.remaining()).toBe(0);

    store.toggle(task.id);
    expect(store.tasks()[0].done).toBeFalse();
    expect(store.remaining()).toBe(1);
  });

  it('removes a task', () => {
    store.add('buy milk');
    const [task] = store.tasks();

    store.remove(task.id);

    expect(store.tasks()).toEqual([]);
  });
});
