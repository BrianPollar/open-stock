// //TODO LATER AT convienience
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Receipt } from '../../../../stock-counter-client/src/defines/receipt.define';
import { } from '../../../../stock-counter-client/src/defines/invoice.define';
import Axios from 'axios-observable';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import { createMockReceipt, createMockReceipts, createMockInvoiceRelated } from '../../../../tests/stock-counter-mocks';

vi.mock('../../../../stock-counter-client/src/defines/invoice.define');

describe('Receipt', () => {
  let instance: Receipt;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockReceipt();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Receipt);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.ammountRcievd).toBeDefined();
    expect(instance.paymentMode).toBeDefined();
    expect(instance.type).toBeDefined();
  });

  it('#getReceipts static should get Receipts array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockReceipts(10)));
    const list = await Receipt.getReceipts(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Receipt[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneReceipt static should get one Receipt', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockReceipt()));
    const one = await Receipt.getOneReceipt(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Receipt);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addReceipt static should add one Receipt', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Receipt.addReceipt(
      companyId,
      createMockReceipt(),
      createMockInvoiceRelated());
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteReceipts static should delete many Receipts', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Receipt.deleteReceipts(companyId, []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateReciept should update Receipt', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateReciept(
      companyId,
      createMockReceipt(),
      createMockInvoiceRelated());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
