import { makeRandomString } from '../../../../stock-universal/src/constants/makerandomstring';
import { describe, it, expect } from 'vitest';

describe('makeRandomString', () => {
  it('should generate a random string of numbers', () => {
    const randomString = makeRandomString(10, 'numbers');
    expect(randomString).toMatch(/^[0-9]{10}$/);
  });

  it('should generate a random string of letters', () => {
    const randomString = makeRandomString(10, 'letters');
    expect(randomString).toMatch(/^[a-z]{10}$/);
  });

  it('should generate a random string of numbers and letters', () => {
    const randomString = makeRandomString(10, 'combined');
    expect(randomString).toMatch(/^[a-z0-9]{10}$/);
  });
});
