/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { InvoiceReport } from '../../../../../stock-counter-client/src/defines/reports/invoicereport.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { IinvoicesReport } from '@open-stock/stock-universal';
import { createMockInvoiceReport, createMockInvoiceReports } from '../../../../../tests/mocks';

describe('InvoiceReport', () => {
  let instance: InvoiceReport;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockInvoiceReport();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(InvoiceReport);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.totalAmount).toBeDefined();
    expect(instance.date).toBeDefined();
    expect(instance.invoices).toBeDefined();
  });

  it('#getInvoiceReports static should get InvoiceReports array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoiceReports(10)));
    const list = await InvoiceReport.getInvoiceReports('/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<InvoiceReport[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneInvoiceReport should get one InvoiceReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoiceReport()));
    const one = await InvoiceReport.getOneInvoiceReport('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(InvoiceReport);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addInvoiceReport should add one InvoiceReport', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await InvoiceReport.addInvoiceReport(createMockInvoiceReport() as IinvoicesReport);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteInvoiceReports should delete many InvoiceReports', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await InvoiceReport.deleteInvoiceReports(['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});

