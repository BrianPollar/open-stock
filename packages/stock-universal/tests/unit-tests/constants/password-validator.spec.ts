import { describe, expect, it } from 'vitest';
import { validatePasswordMatch } from '../../../src/constants/password-validator';

describe('validatePasswordMatch', () => {
  it('should return valid true and message "passwords match" when passwords match', () => {
    const password = 'password123';
    const otherPassword = 'password123';
    const result = validatePasswordMatch(password, otherPassword);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('passwords match');
  });

  it('should return valid false and message "passwords did not match" when passwords do not match', () => {
    const password = 'password123';
    const otherPassword = 'password456';
    const result = validatePasswordMatch(password, otherPassword);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('passwords did not match');
  });
});
