import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../../src/constants/email-validator';

describe('validateEmail', () => {
  it('should return valid email for a valid email address', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('valid email');
  });

  it('should return invalid email for an invalid email address', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('invalid email');
  });
});
