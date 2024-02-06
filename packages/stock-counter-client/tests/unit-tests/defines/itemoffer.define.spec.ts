import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { ItemOffer } from '../../../../stock-counter-client/src/defines/itemoffer.define';
import { of } from 'rxjs';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import Axios from 'axios-observable';
import { createMockItemOffer, createMockItemOffers } from '../../../../tests/stock-counter-mocks';

describe('ItemOffer', () => {
  let instance: ItemOffer;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockItemOffer();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(ItemOffer);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.items).toBeDefined();
    expect(instance.expireAt).toBeDefined();
    expect(instance.type).toBeDefined();
    expect(instance.header).toBeDefined();
    expect(instance.subHeader).toBeDefined();
    expect(instance.ammount).toBeDefined();
  });

  it('#getItemOffers static should get ItemOffers array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItemOffers(10)));
    const list = await ItemOffer.getItemOffers(companyId, '/');
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<ItemOffer[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneItemOffer static should get one ItemOffer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItemOffer()));
    const one = await ItemOffer.getOneItemOffer(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(ItemOffer);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createItemOffer static should add one ItemOffer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await ItemOffer.createItemOffer(companyId, createMockItemOffer());
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteItemOffers static should delete many ItemOffers', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await ItemOffer.deleteItemOffers(companyId, ['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateItemOffer should update ItemOffer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateItemOffer(companyId, createMockItemOffer());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteItemOffer should delete ItemOffer', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteItemOffer(companyId);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
