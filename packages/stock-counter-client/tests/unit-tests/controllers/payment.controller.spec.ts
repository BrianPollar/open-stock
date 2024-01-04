/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undefined */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import { PaymentController } from '../../../../stock-counter-client/src/controllers/payment.controller';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockCarts, createMockDeliveryCity, createMockDeliveryCitys } from '../../../../tests/stock-counter-mocks';
import { createMockAddress } from '../../../../tests/stock-auth-mocks';

describe('PaymentController', () => {
  let instance: PaymentController;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = new PaymentController();
  });

  it('its real instance of PaymentController', () => {
    expect(instance).toBeInstanceOf(PaymentController);
  });

  it('should have an empty constructor', () => {
    expect(instance.constructor).toBeDefined();
  });

  it('#calculateTargetPriceOrShipping to return price without shipping', () => {
    const calculated = instance.calculateTargetPriceOrShipping(false, createMockCarts(10), createMockDeliveryCity(), null);
    expect(typeof calculated).toBe('object');
    expect(calculated).toHaveProperty('totalCost');
    expect(calculated).toHaveProperty('res');
    expect(typeof calculated.totalCost).toBe('number');
    expect(typeof calculated.res).toBe('number');
    expect(calculated.totalShipping).toBe(undefined);
  });

  it('#calculateTargetPriceOrShipping to return shipping only', () => {
    const calculated = instance.calculateTargetPriceOrShipping(true, createMockCarts(10), createMockDeliveryCity(), null);
    expect(typeof calculated).toBe('object');
    expect(calculated).toHaveProperty('totalCost');
    expect(calculated).toHaveProperty('res');
    expect(calculated).toHaveProperty('totalShipping');
    expect(calculated.totalCost).toBe(undefined);
    expect(typeof calculated.res).toBe('number');
    expect(typeof calculated.totalShipping).toBe('number');
  });

  it('#calculateTargetPriceAndShipping to return price with shipping', () => {
    const calculated = instance.calculateTargetPriceAndShipping(createMockCarts(10), createMockDeliveryCity(), null);
    expect(typeof calculated).toBe('object');
    expect(calculated).toHaveProperty('res');
    expect(calculated).toHaveProperty('totalCostNshipping');
    expect(calculated).toHaveProperty('qntity');
    expect(calculated).toHaveProperty('totalPdct');
    expect(calculated).toHaveProperty('totShip');
    expect(typeof calculated.res).toBe('number');
    expect(typeof calculated.totalCostNshipping).toBe('number');
    expect(typeof calculated.qntity).toBe('number');
    expect(typeof calculated.totalPdct).toBe('number');
    expect(typeof calculated.totShip).toBe('number');
  });

  it('#getDeliveryCitys should append city to PaymentController', async() => {
    vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliveryCitys(10)));
    const citysArg = createMockDeliveryCitys(10);
    const city = await instance.getDeliveryCitys(companyId, citysArg);
    expect(typeof city).toBe('object');
    expect(city.length).toBeDefined();
  });

  it('#determineCity should return the expected date', () => {
    vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliveryCitys(10)));
    const citys = createMockDeliveryCitys(10);
    const addr = createMockAddress();
    // @ts-ignore
    addr.city = citys[0]._id;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 10);
    // const actualDate = await instance.determineCity(citys, addr);
    expect(typeof expectedDate).toBe('object');
  });
});
