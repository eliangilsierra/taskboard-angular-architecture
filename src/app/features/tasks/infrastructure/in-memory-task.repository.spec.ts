import { firstValueFrom } from 'rxjs';
import { TaskNotFoundError } from '../domain/task';
import { InMemoryTaskRepository } from './in-memory-task.repository';

describe('InMemoryTaskRepository', () => {
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('starts empty', async () => {
    expect(await firstValueFrom(repository.list())).toEqual([]);
  });

  it('assigns unique ids to added tasks', async () => {
    const first = await firstValueFrom(repository.add('first'));
    const second = await firstValueFrom(repository.add('second'));

    expect(first.id).not.toEqual(second.id);
    expect(await firstValueFrom(repository.list())).toEqual([first, second]);
  });

  it('updates the completion state of a task', async () => {
    const task = await firstValueFrom(repository.add('first'));

    const updated = await firstValueFrom(repository.setDone(task.id, true));

    expect(updated).toEqual({ ...task, done: true });
    expect(await firstValueFrom(repository.list())).toEqual([updated]);
  });

  it('removes a task', async () => {
    const task = await firstValueFrom(repository.add('first'));

    await firstValueFrom(repository.remove(task.id));

    expect(await firstValueFrom(repository.list())).toEqual([]);
  });

  it('fails when the task does not exist', async () => {
    await expectAsync(firstValueFrom(repository.setDone('missing', true))).toBeRejectedWithError(
      TaskNotFoundError
    );
    await expectAsync(firstValueFrom(repository.remove('missing'))).toBeRejectedWithError(
      TaskNotFoundError
    );
  });
});
