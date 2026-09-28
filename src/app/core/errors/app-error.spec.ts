import { AppError, UNEXPECTED_ERROR_MESSAGE, toAppError } from './app-error';

describe('toAppError', () => {
  it('returns application errors as they are', () => {
    const original = new AppError('validation', 'Invalid');
    expect(toAppError(original)).toBe(original);
  });

  it('wraps anything else as an unexpected error and keeps the cause', () => {
    const cause = new Error('boom');

    const error = toAppError(cause);

    expect(error.kind).toBe('unexpected');
    expect(error.userMessage).toBe(UNEXPECTED_ERROR_MESSAGE);
    expect(error.cause).toBe(cause);
  });

  it('wraps values that are not errors', () => {
    expect(toAppError('a string').kind).toBe('unexpected');
  });
});
