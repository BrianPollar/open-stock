import { Iexpense } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Expense } from '../../../../stock-counter-client/src/defines/expense.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { createMockExpense, createMockExpenses } from '../../../../tests/stock-counter-mocks';

describe('Expense', () => {
  let instance: Expense;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockExpense();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });


  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Expense);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.name).toBeDefined();
    expect(instance.person).toBeDefined();
    expect(instance.cost).toBeDefined();
    expect(instance.category).toBeDefined();
  });

  it('#getExpenses static should get Expenses array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockExpenses(10)));
    const list = await Expense.getExpenses(companyId, '/', 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Expense[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneExpense static should get one Expense', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockExpense()));
    const one = await Expense.getOneExpense(companyId, 'urId');

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Expense);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addExpense static should add one Expense', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Expense.addExpense(companyId, createMockExpense() as unknown as Iexpense);

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteExpenses static should delete many Expenses', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Expense.deleteExpenses(companyId, ['ids']);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toBe(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateExpense should update Expense', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateExpense(companyId, createMockExpense() as unknown as Iexpense);

    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toBe(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteExpense should delete Expense', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteExpense(companyId);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
