/* import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { PaymentInstall } from '../../../../stock-counter-client/src/defines/paymentinstalls.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockPaymentInstall, createMockPaymentInstalls } from '../../../../tests/mocks';

describe('PaymentInstall', () => {
  let instance: PaymentInstall;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockPaymentInstall();
  });

  it('#StockCounterClient should havÍe all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(PaymentInstall);
    // expect(instance._id).toBeDefined();
    /*
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.amount).toBeDefined();
    expect(instance.date).toBeDefined();
    expect(instance.type).toBeDefined();
    expect(instance.relatedId).toBeDefined();
    */
/* });

  it('#getPaymentInstalls static should get PaymentInstalls array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockPaymentInstalls(10)));
    const list = await PaymentInstall.getPaymentInstalls('/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<PaymentInstall[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOnePayment static should get one PaymentInstall', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockPaymentInstall()));
    const one = await PaymentInstall.getOnePayment('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(PaymentInstall);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deletePayments static should delete many PaymentInstalls', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await PaymentInstall.deletePayments(['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deletePayment should delete PaymentInstall', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deletePayment();
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
*/
