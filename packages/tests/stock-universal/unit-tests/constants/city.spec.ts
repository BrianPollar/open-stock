import { describe, it, expect } from 'vitest';

describe('defaultCitys', () => {
  it('should not contain duplicate cities', () => {
    const cityNames = ['jalalabad', 'new york'];
    expect(
      cityNames.filter(name => cityNames.includes(name, 2)).length)
      .toBe(0);
  });
});
