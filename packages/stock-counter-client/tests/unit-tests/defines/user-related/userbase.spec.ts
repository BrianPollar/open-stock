import Axios from 'axios-observable';
import { beforeEach, describe, expect, it } from 'vitest';
import { StockAuthClient } from '../../../../../stock-auth-client/src/stock-auth-client';
import { UserBase } from '../../../../../stock-counter-client/src/defines/user-related/userbase.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { createMockUserBase } from '../../../../../tests/stock-counter-mocks';

class TestBaseUser
  extends UserBase {
  constructor(data) {
    super(data);
  }
}

describe('UserBase', () => {
  let instance: TestBaseUser;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockAuthClient(axiosMock);
    new StockCounterClient(axiosMock);
    instance = new TestBaseUser(createMockUserBase());
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(UserBase);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.user).toBeDefined();
    expect(instance.startDate).toBeDefined();
    expect(instance.endDate).toBeDefined();
    expect(instance.occupation).toBeDefined();
  });
});
