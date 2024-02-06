import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Cookies } from '../../../../stock-counter-client/src/defines/cookies.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import { IcartInterface } from '../../../../stock-universal';
import { Item } from '../../../../stock-counter-client/src/defines/item.define';
import Axios from 'axios-observable';
import { createMockItem, createMockItems } from '../../../../tests/stock-counter-mocks';

describe('Cookies', () => {
  let instance: Cookies;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = new Cookies();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties undefined', () => {
    expect(instance).toBeInstanceOf(Cookies);
    expect(instance.cartEnabled).toBeUndefined();
    expect(instance.recentEnabled).toBeUndefined();
  });

  it('#getSettings should get Cookies setting', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of({ body: { cartEnabled: true, recentEnabled: true } }));
    const stn = await instance.getSettings();
    expect(stn).toBeUndefined();
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateSettings should update Cookies setting', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ body: { success: true } }));
    const updated = await instance.updateSettings({ cartEnabled: true, recentEnabled: true });
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addCartItem should add cart item to Cookies', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ body: { success: true } }));
    instance.cartEnabled = true;
    const cartAdded = await instance.addCartItem('id', 1000);
    expect(typeof cartAdded).toEqual('object');
    expect(cartAdded).toHaveProperty('success');
    expect(cartAdded.success).toEqual(true);
    expect(typeof cartAdded.success).toBe('boolean');
    expectTypeOf(cartAdded.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addRecent should add recent item to Cookies', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ body: { success: true } }));
    instance.recentEnabled = true;
    const recentAdded = await instance.addRecent('id');
    expect(typeof recentAdded).toEqual('object');
    expect(recentAdded).toHaveProperty('success');
    expect(recentAdded.success).toEqual(true);
    expect(typeof recentAdded.success).toBe('boolean');
    expectTypeOf(recentAdded.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteCartItem should delete cart item from Cookies', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ body: { success: true } }));
    instance.cartEnabled = true;
    const deleted = await instance.deleteCartItem('id');
    expect(typeof deleted).toBe('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#clearCart should clear cart from the Cookies', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ body: { success: true } }));
    instance.cartEnabled = true;
    const cartCleard = await instance.clearCart();
    expect(typeof cartCleard).toEqual('object');
    expect(cartCleard).toHaveProperty('success');
    expect(cartCleard.success).toEqual(true);
    expect(typeof cartCleard.success).toBe('boolean');
    expectTypeOf(cartCleard.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#appendToCart should get cart from Cookies and append real items object to it', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of({ body: {
      item: createMockItem(),
      totalCostwithNoShipping: 1000
    } }));
    instance.cartEnabled = true;
    const cartAppended = await instance.appendToCart() as unknown as IcartInterface;
    expect(typeof cartAppended).toEqual('object');
    expect(cartAppended).toHaveProperty('item');
    expect(typeof cartAppended.item).toBe('object');
    // expect(cartAppended.item.length).toBeGreaterThan(0);
    // expect(cartAppended.item[0]).toBeInstanceOf(Item);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#appendToRecent should get recent items from Cookies return real items object from it', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of({ body: createMockItems(10) }));
    instance.recentEnabled = true;
    const recentAppended = await instance.appendToRecent() as unknown as Item[];
    expect(typeof recentAppended).toBe('object');
    expect(recentAppended.length).toBeGreaterThan(1);
    expect(lSpy).toHaveBeenCalled();
  });
});
