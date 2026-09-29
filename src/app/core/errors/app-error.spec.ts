import { AppError, UNEXPECTED_ERROR_MESSAGE, createErrorId, toAppError } from './app-error';

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

describe('error references', () => {
  it('has a fixed length and only lowercase letters and digits', () => {
    for (let i = 0; i < 50; i++) {
      expect(createErrorId()).toMatch(/^[a-z0-9]{8}$/);
    }
  });

  it('gives every error its own reference', () => {
    const first = new AppError('unexpected', 'a');
    const second = new AppError('unexpected', 'b');

    expect(first.id).toMatch(/^[a-z0-9]{8}$/);
    expect(first.id).not.toBe(second.id);
  });

  it('keeps the reference when an error is converted again', () => {
    const original = new AppError('not-found', 'gone');
    expect(toAppError(original).id).toBe(original.id);
  });
});
