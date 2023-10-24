/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { ItemDecoy } from '../../../../stock-counter-client/src/defines/itemdecoy.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockItemDecoys, createMockItemDecoy } from '../../../../tests/mocks';

describe('ItemDecoy', () => {
  let instance: ItemDecoy;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockItemDecoy();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(ItemDecoy);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.items).toBeDefined();
  });

  it('#getItemDecoys static should get ItemDecoys array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItemDecoys(10)));
    const list = await ItemDecoy.getItemDecoys('/');
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<ItemDecoy[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneItemDecoy static should get one ItemDecoy', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItemDecoy()));
    const one = await ItemDecoy.getOneItemDecoy('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(ItemDecoy);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createItemDecoy static should add one ItemDecoy', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await ItemDecoy.createItemDecoy('manual', { items: [] });
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteItemDecoys static should delete many ItemDecoys', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await ItemDecoy.deleteItemDecoys(['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteItemDecoy should delete ItemDecoy', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteItemDecoy();
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});

