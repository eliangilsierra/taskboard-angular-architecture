import { AppError, toAppError } from '@core/errors/app-error';
import { InvalidTaskTitleError, TaskNotFoundError } from '../domain/task';

/** Translates the failures of the tasks domain into errors the UI can present. */
export function toTaskAppError(error: unknown): AppError {
  if (error instanceof InvalidTaskTitleError) {
    return new AppError('validation', error.message, { cause: error });
  }
  if (error instanceof TaskNotFoundError) {
    return new AppError('not-found', 'That task no longer exists.', { cause: error });
  }
  return toAppError(error);
}
