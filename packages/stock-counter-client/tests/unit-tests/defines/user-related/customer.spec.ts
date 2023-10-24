/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { Customer } from '../../../../../stock-counter-client/src/defines/user-related/customer.define';
import { createMockCustomer, createMockCustomers } from '../../../../../tests/mocks';

describe('Customer', () => {
  let instance: Customer;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockCustomer();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Customer);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.otherAddresses).toBeDefined();
  });

  it('#getCustomers static should get Customers array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockCustomers(10)));
    const list = await Customer.getCustomers(0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Customer[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneCustomer static should get one Customer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockCustomer()));
    const one = await Customer.getOneCustomer('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Customer);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createCustomer static should add one Customer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Customer.createCustomer(createMockCustomer() as any);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteCustomers static should delete many Customers', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Customer.deleteCustomers([], []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateCustomer should update Customer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateCustomer(createMockCustomer() as any);
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteCustomer should delete Customer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteCustomer([] as any, [] as any);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});

