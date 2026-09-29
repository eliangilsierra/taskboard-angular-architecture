import { Task } from '../domain/task';
import { tasksActions } from './tasks.actions';
import { TasksState, initialTasksState, tasksFeature } from './tasks.reducer';

describe('tasks reducer', () => {
  const milk: Task = { id: '1', title: 'buy milk', done: false };
  const bread: Task = { id: '2', title: 'buy bread', done: false };
  const reduce = tasksFeature.reducer;

  it('starts empty', () => {
    expect(reduce(undefined, { type: '@@init' })).toEqual(initialTasksState);
  });

  it('replaces the tasks when they are loaded', () => {
    const state = reduce(initialTasksState, tasksActions.loaded({ tasks: [milk, bread] }));
    expect(state.tasks).toEqual([milk, bread]);
  });

  it('appends an added task', () => {
    const state = reduce({ tasks: [milk] }, tasksActions.added({ task: bread }));
    expect(state.tasks).toEqual([milk, bread]);
  });

  it('replaces a toggled task in place', () => {
    const done = { ...milk, done: true };
    const state = reduce({ tasks: [milk, bread] }, tasksActions.toggled({ task: done }));
    expect(state.tasks).toEqual([done, bread]);
  });

  it('drops a removed task', () => {
    const state = reduce({ tasks: [milk, bread] }, tasksActions.removed({ id: milk.id }));
    expect(state.tasks).toEqual([bread]);
  });

  it('ignores failures', () => {
    const before: TasksState = { tasks: [milk] };
    expect(reduce(before, tasksActions.failed({ error: new Error('boom') }))).toBe(before);
  });
});

describe('remaining selector', () => {
  it('counts the tasks that are not done', () => {
    const tasks: Task[] = [
      { id: '1', title: 'a', done: true },
      { id: '2', title: 'b', done: false },
      { id: '3', title: 'c', done: false }
    ];
    expect(tasksFeature.selectRemaining.projector(tasks)).toBe(2);
  });
});
