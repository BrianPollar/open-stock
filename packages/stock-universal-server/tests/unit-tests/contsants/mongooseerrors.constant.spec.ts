import { describe, expect, it } from 'vitest';
import { stringifyMongooseErr } from '../../../src/constants/mongooseerrors.constant';

describe('stringifyMongooseErr', () => {
  it('should return a string with concatenated error messages', () => {
    const errors = {
      name: { kind: 'unique', message: 'Name must be unique' },
      age: { kind: 'required', message: 'Age is required' },
      email: { kind: 'unique', message: 'Email must be unique' }
    };
    const expectedErrorMessage = 'Name must be unique, age Age is required, Email must be unique';
    const result = stringifyMongooseErr(errors);

    expect(result).toEqual(expectedErrorMessage);
  });

  it('should return an empty string if errors object is empty', () => {
    const errors = {};
    const expectedErrorMessage = '';
    const result = stringifyMongooseErr(errors);

    expect(result).toEqual(expectedErrorMessage);
  });
});
