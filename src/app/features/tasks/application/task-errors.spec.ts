import { AppError } from '@core/errors/app-error';
import { InvalidTaskTitleError, TaskNotFoundError } from '../domain/task';
import { toTaskAppError } from './task-errors';

describe('toTaskAppError', () => {
  it('maps an invalid title to a validation error that keeps the domain message', () => {
    const cause = new InvalidTaskTitleError();

    const error = toTaskAppError(cause);

    expect(error.kind).toBe('validation');
    expect(error.userMessage).toBe(cause.message);
    expect(error.cause).toBe(cause);
  });

  it('maps a missing task to a not-found error', () => {
    const cause = new TaskNotFoundError('7');

    const error = toTaskAppError(cause);

    expect(error.kind).toBe('not-found');
    expect(error.cause).toBe(cause);
  });

  it('falls back to an unexpected error for anything else', () => {
    expect(toTaskAppError(new Error('boom')).kind).toBe('unexpected');
  });

  it('leaves errors that are already application errors untouched', () => {
    const original = new AppError('not-found', 'gone');
    expect(toTaskAppError(original)).toBe(original);
  });
});
