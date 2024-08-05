import { describe, expect, it } from 'vitest';
import { DatabaseAuto } from '../../../src/defines/base.define';

class TestBase extends DatabaseAuto {
  constructor(data) {
    super(data);
  }
}

describe('DatabaseAuto', () => {
  it('should initialize class properties correctly', () => {
    const data = {
      _id: '123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const instance = new TestBase(data);

    expect(instance._id).toEqual(data._id);
    expect(instance.createdAt).toEqual(data.createdAt);
    expect(instance.updatedAt).toEqual(data.updatedAt);
  });
});
