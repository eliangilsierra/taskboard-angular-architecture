import { InvalidTaskTitleError, MAX_TASK_TITLE_LENGTH, isValidTitle, normalizeTitle } from './task';

describe('task title rules', () => {
  it('rejects blank titles', () => {
    expect(isValidTitle('')).toBeFalse();
    expect(isValidTitle('   ')).toBeFalse();
  });

  it('rejects titles longer than the limit', () => {
    expect(isValidTitle('a'.repeat(MAX_TASK_TITLE_LENGTH + 1))).toBeFalse();
  });

  it('accepts titles up to the limit', () => {
    expect(isValidTitle('a'.repeat(MAX_TASK_TITLE_LENGTH))).toBeTrue();
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeTitle('  write tests  ')).toBe('write tests');
  });

  it('throws when normalizing an invalid title', () => {
    expect(() => normalizeTitle('  ')).toThrowError(InvalidTaskTitleError);
  });
});
