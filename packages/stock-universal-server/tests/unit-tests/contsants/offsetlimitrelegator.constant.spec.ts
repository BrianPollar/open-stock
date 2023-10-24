import { expect, describe, it } from 'vitest';
import { offsetLimitRelegator } from '../../../../stock-universal-server/src/constants/offsetlimitrelegator.constant';

describe('offsetLimitRelegator', () => {
  it('should relegate the offset value to 10000 if it is 0', () => {
    const result = offsetLimitRelegator(0, 10);
    expect(result.offset).toBe(10000);
  });

  it('should relegate the limit value to 10000 if it is 0', () => {
    const result = offsetLimitRelegator(10, 0);
    expect(result.limit).toBe(10000);
  });

  it('should not relegate the offset value if it is not 0', () => {
    const result = offsetLimitRelegator(10, 10);
    expect(result.offset).toBe(10);
  });

  it('should not relegate the limit value if it is not 0', () => {
    const result = offsetLimitRelegator(10, 100);
    expect(result.limit).toBe(100);
  });
});
