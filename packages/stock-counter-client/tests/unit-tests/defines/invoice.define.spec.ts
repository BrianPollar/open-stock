/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Invoice } from '../../../../stock-counter-client/src/defines/invoice.define';
import { IdeleteCredentialsInvRel } from '../../../../stock-universal';
import { faker } from '@faker-js/faker/locale/en_US';
import { of } from 'rxjs';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import Axios from 'axios-observable';
import { Iinvoice, IinvoiceRelated } from '@open-stock/stock-universal/src';
import { createMockInvoice, createMockInvoiceRelated, createMockInvoices } from '../../../../tests/stock-counter-mocks';

describe('Invoice', () => {
  let instance: Invoice;
  const axiosMock = { } as Axios;
  const companyId = faker.string.uuid();

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockInvoice();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Invoice);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.dueDate).toBeDefined();
  });

  it('#getInvoices static should get Invoices array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoices(10)));
    const list = await Invoice.getInvoices(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Invoice[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneInvoice static should get one Invoice', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoice()));
    const one = await Invoice.getOneInvoice(companyId, 1);
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Invoice);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addInvoice static should add one Invoice', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Invoice.addInvoice(
      companyId,
      createMockInvoice() as Iinvoice,
      createMockInvoiceRelated() as IinvoiceRelated);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteInvoices static should delete many Invoices', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const credentials: IdeleteCredentialsInvRel[] = [{
      id: faker.string.uuid(),
      creationType: 'flow',
      invoiceRelated: faker.string.uuid(),
      stage: 'invoice'
    }];
    const deleted = await Invoice.deleteInvoices(companyId, credentials);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#update should update Invoice', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.update(
      companyId,
      createMockInvoice() as Iinvoice,
      createMockInvoiceRelated());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
