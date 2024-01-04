import { expect, describe, it } from 'vitest';
import { verifyObjectId } from '../../../../stock-universal-server/src/constants/verify.constant';

describe('verifyObjectId', () => {
  it('should return `true` if the `val` parameter is a valid ObjectID', () => {
    const val = '5f0d85505266380003185161';
    const result = verifyObjectId(val);
    expect(result).toBe(true);
  });

  it('should return `false` if the `val` parameter is not a valid ObjectID', () => {
    const val = 'invalid-objectid';
    const result = verifyObjectId(val);
    expect(result).toBe(false);
  });

  it('should log the `val` parameter', () => {
    /* const val = '5f0d85505266380003185161';
    // const logSpy = vi.spyOn(verifyLogger, 'info');
    verifyObjectId(val);
    expect(logSpy).toHaveBeenCalledWith('val for verifyObjectId', val);
    logSpy.mockRestore();
    */
  });

  it('should log the `isValid` variable', () => {
    /* const val = '5f0d85505266380003185161';
    const logSpy = vi.spyOn(verifyLogger, 'debug');
    verifyObjectId(val);
    expect(logSpy).toHaveBeenCalledWith('isValid from verifyObjectId', true);
    logSpy.mockRestore();
    */
  });

  it('should return `false` if the `val` parameter is not a valid ObjectID', () => {
    const val = 'invalid-objectid';
    const result = verifyObjectId(val);
    expect(result).toBe(false);
  });

  it('should return `true` if the string representation of the new ObjectID is equal to the `val` parameter', () => {
    const val = '5f0d85505266380003185161';
    const result = verifyObjectId(val);
    expect(result).toBe(true);
  });
});
