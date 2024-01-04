/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Order } from '../../../../stock-counter-client/src/defines/order.define';
import Axios from 'axios-observable';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import { createMockOrder, createMockOrders, createMockInvoiceRelated, createMockPayment, createMockPaymentRelated } from '../../../../tests/stock-counter-mocks';

describe('Order', () => {
  let instance: Order;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockOrder();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Order);
    expect(instance.price).toBeDefined();
    // expect(instance.paymentMethod).toBeDefined();
    expect(instance.deliveryDate).toBeDefined();
    // expect(instance.status).toBeDefined();
  });

  it('#getOrders static should get Orders array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockOrders(10)));
    const list = await Order.getOrders(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Order[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#searchOrders static should search Orders and return array of matching items', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of(createMockOrders(10)));
    const list = await Order.searchOrders(companyId, '/', '/');
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Order[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneOrder static should get one Order', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockOrder()));
    const one = await Order.getOneOrder(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Order);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#makeOrder static should make Order', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Order.makeOrder(
      companyId,
      createMockPaymentRelated(),
      createMockInvoiceRelated(),
      createMockOrder(),
      createMockPayment(), null);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createOrder static should add one Order', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Order.createOrder(
      companyId,
      createMockPaymentRelated(),
      createMockInvoiceRelated(),
      createMockOrder(),
      createMockPayment(), null);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteOrders static should delete many Orders', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Order.deleteOrders(companyId, []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateOrder should update Order', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateOrder(
      companyId,
      createMockOrder(),
      createMockPaymentRelated(),
      createMockInvoiceRelated());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(typeof updated.success).toBe('boolean');
    expect(updated.success).toEqual(true);
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#appendDelivery should change status of order and payment', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.appendDelivery(companyId, 'pending');
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(typeof updated.success).toBe('boolean');
    expect(updated.success).toBe(true);
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
