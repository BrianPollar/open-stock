/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { expect, describe, beforeEach, it } from 'vitest';
import Axios from 'axios-observable';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { UserBase } from '../../../../../stock-counter-client/src/defines/user-related/userbase.define';
import { StockAuthClient } from '../../../../../stock-auth-client/src/stock-auth-client';
import { createMockUserBase } from '../../../../../tests/mocks';

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
    instance = new TestBaseUser(createMockUserBase() as any);
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

