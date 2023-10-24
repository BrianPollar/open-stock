/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { ProfitAndLossReport } from '../../../../../stock-counter-client/src/defines/reports/profitandlossreport.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockProfitAndLossReport, createMockProfitAndLossReports } from '../../../../../tests/mocks';
import { IprofitAndLossReport } from '@open-stock/stock-universal';

describe('ProfitAndLossReport', () => {
  let instance: ProfitAndLossReport;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockProfitAndLossReport();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(ProfitAndLossReport);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.totalAmount).toBeDefined();
    expect(instance.date).toBeDefined();
    expect(instance.expenses).toBeDefined();
    expect(instance.invoiceRelateds).toBeDefined();
  });

  it('#getProfitAndLossReports should get ProfitAndLossReports array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockProfitAndLossReports(10)));
    const list = await ProfitAndLossReport.getProfitAndLossReports('/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<ProfitAndLossReport[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneProfitAndLossReport should get one ProfitAndLossReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockProfitAndLossReport()));
    const one = await ProfitAndLossReport.getOneProfitAndLossReport('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(ProfitAndLossReport);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addProfitAndLossReport should add one ProfitAndLossReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await ProfitAndLossReport.addProfitAndLossReport(createMockProfitAndLossReport() as unknown as IprofitAndLossReport);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteProfitAndLossReports should delete many ProfitAndLossReports', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await ProfitAndLossReport.deleteProfitAndLossReports(['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toEqual('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});

