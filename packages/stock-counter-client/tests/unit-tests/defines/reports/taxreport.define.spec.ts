/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { TaxReport } from '../../../../../stock-counter-client/src/defines/reports/taxreport.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { ItaxReport } from '@open-stock/stock-universal';
import { createMockTaxReport, createMockTaxReports } from '../../../../../tests/stock-counter-mocks';

describe('Environment', () => {
  let instance: TaxReport;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockTaxReport();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(TaxReport);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.totalAmount).toBeDefined();
    expect(instance.date).toBeDefined();
    expect(instance.estimates).toBeDefined();
    expect(instance.invoiceRelateds).toBeDefined();
  });

  it('#getTaxReports static should get TaxReports array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockTaxReports(10)));
    const list = await TaxReport.getTaxReports(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<TaxReport[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneTaxReport static should get one TaxReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockTaxReport()));
    const one = await TaxReport.getOneTaxReport(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(TaxReport);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addTaxReport static should add one TaxReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await TaxReport.addTaxReport(companyId, createMockTaxReport() as ItaxReport);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteTaxReports static should delete many TaxReports', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await TaxReport.deleteTaxReports(companyId, ['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
