import { describe, it, expect } from 'vitest';
import { validatePhone } from '../../../src/constants/phone-validator';

describe('validatePhone', () => {
  it('should return valid: false and message: "not a number" if value is not a number', () => {
    const result = validatePhone('abc');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('not a number');
  });

  it('should return valid: false and message: "not a whole number" if value is not a whole number', () => {
    const result = validatePhone(10.5);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('not a whole number');
  });

  it('should return valid: false and message: "less than 7" if value length is less than 7', () => {
    const result = validatePhone('123456');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('less than 7');
  });

  it('should return valid: false and message: "more than 15" if value length is more than 15', () => {
    const result = validatePhone('1234567890123456');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('more than 15');
  });

  it('should return valid: true and message: "correct number format" if value is a valid phone number', () => {
    const result = validatePhone('1234567890');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('correct number format');
  });
});
