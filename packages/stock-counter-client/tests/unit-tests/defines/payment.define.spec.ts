/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Payment } from '../../../../stock-counter-client/src/defines/payment.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockPayment, createMockPaymentRelated, createMockPayments, createMockInvoiceRelated, createMockOrder } from '../../../../tests/stock-counter-mocks';

describe('Payment', () => {
  let instance: Payment;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockPayment();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Payment);
    // expect(instance._id).toBeDefined();
    // expect(instance.createdAt).toBeDefined();
    // expect(instance.updatedAt).toBeDefined();
    // expect(instance.urId).toBeDefined();
    expect(instance.order).toBeDefined();
  });

  it('#getPayments static should get Payments array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockPayments(10)));
    const list = await Payment.getPayments(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Payment[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#searchPayments static should search Payments and return matching items array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of(createMockPayments(10)));
    const list = await Payment.searchPayments(companyId, '/', '/');
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Payment[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOnePayment static should get one Payment', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockPayment()));
    const one = await Payment.getOnePayment(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Payment);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createPayment static should add one Payment', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Payment.createPayment(
      companyId,
      createMockPaymentRelated(),
      createMockInvoiceRelated(),
      createMockOrder(),
      createMockPayment(),
      null);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deletePayments static should delete many Payments', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Payment.deletePayments(companyId, []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updatePayment should update Payment', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updatePayment(
      companyId,
      createMockPayment(),
      createMockPaymentRelated(),
      createMockInvoiceRelated());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deletePayment should delete Payment', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deletePayment(companyId);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
