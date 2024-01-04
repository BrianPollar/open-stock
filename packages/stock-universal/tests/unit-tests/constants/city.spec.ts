import { describe, it, expect } from 'vitest';
import { defaultCitys } from '../../../src/constants/city';

describe('defaultCitys', () => {
  it('should not contain duplicate cities', () => {
    const cityNames = defaultCitys.map(city => city.name);
    const duplicateCities = cityNames.filter((name, index) => cityNames.indexOf(name) !== index);
    expect(duplicateCities.length).toBe(0);
  });
});
