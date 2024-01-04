/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { DeliveryCity } from '../../../../stock-counter-client/src/defines/delivery.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { Ideliverycity } from '@open-stock/stock-universal';
import { createMockDeliveryCity, createMockDeliveryCitys } from '../../../../tests/stock-counter-mocks';

describe('DeliveryCity', () => {
  let instance: DeliveryCity;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockDeliveryCity();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(DeliveryCity);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.name).toBeDefined();
    expect(instance.shippingCost).toBeDefined();
    expect(instance.currency).toBeDefined();
    expect(instance.deliversInDays).toBeDefined();
  });

  it('#getDeliveryCitys static should get DeliveryCitys array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliveryCitys(10)));
    const list = await DeliveryCity.getDeliveryCitys(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<DeliveryCity[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneDeliveryCity static should get one DeliveryCity', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliveryCity()));
    const one = await DeliveryCity.getOneDeliveryCity(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(DeliveryCity);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createDeliveryCity static should add one DeliveryCity', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await DeliveryCity.createDeliveryCity(companyId, createMockDeliveryCity() as Ideliverycity);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteDeliveryCitys static should delete many DeliveryCitys', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await DeliveryCity.deleteDeliveryCitys(companyId, ['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateDeliveryCity should update DeliveryCity', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateDeliveryCity(companyId, createMockDeliveryCity());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteDeliveryCity should delete DeliveryCity', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteDeliveryCity(companyId);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
