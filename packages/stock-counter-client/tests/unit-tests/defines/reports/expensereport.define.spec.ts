import { IexpenseReport } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ExpenseReport } from '../../../../../stock-counter-client/src/defines/reports/expensereport.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { createMockExpenseReport, createMockExpenseReports } from '../../../../../tests/stock-counter-mocks';

describe('ExpenseReport', () => {
  let instance: ExpenseReport;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockExpenseReport();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(ExpenseReport);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.totalAmount).toBeDefined();
    expect(instance.date).toBeDefined();
    expect(instance.expenses).toBeDefined();
  });

  it('#getExpenseReports static should get ExpenseReports array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockExpenseReports(10)));
    const list = await ExpenseReport.getExpenseReports(companyId, '/', 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<ExpenseReport[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneExpenseReport static should get one ExpenseReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockExpenseReport()));
    const one = await ExpenseReport.getOneExpenseReport(companyId, 'urId');

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(ExpenseReport);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addExpenseReport static should add one ExpenseReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await ExpenseReport.addExpenseReport(companyId, createMockExpenseReport() as unknown as IexpenseReport);

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toEqual('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteExpenseReports static should delete many ExpenseReports', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await ExpenseReport.deleteExpenseReports(companyId, ['_ids']);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
