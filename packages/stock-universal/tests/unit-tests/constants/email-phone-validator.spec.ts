import { describe, expect, it } from 'vitest';
import { emailphoneValidator } from '../../../src/constants/email-phone-validator';

describe('emailphoneValidator', () => {
  it('should validate email', () => {
    const result = emailphoneValidator('test@example.com');

    expect(result.valid).toEqual(true);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('valid email');
  });

  it('should validate phone number', () => {
    const result = emailphoneValidator('1234567890');

    expect(result.valid).toEqual(true);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('correct number format');
  });

  it('should refuse email validation', () => {
    const result = emailphoneValidator('awaw');

    expect(result.valid).toEqual(false);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('invalid email');
  });

  it('should refuse to validate phone number if is less than 7', () => {
    const result = emailphoneValidator('123');

    expect(result.valid).toEqual(false);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('less than 7');
  });

  it('should refuse to validate phone number if is more than 15', () => {
    const result = emailphoneValidator('12456789101112131415');

    expect(result.valid).toEqual(false);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('more than 15');
  });

  it('should refuse to validate phone number if is not a whole number', () => {
    const result = emailphoneValidator('0.5');

    expect(result.valid).toEqual(false);
    expect(result.message).toBeTypeOf('string');
    expect(result.message).toEqual('not a whole number');
  });
});
