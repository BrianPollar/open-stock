import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Item } from '../../../../stock-counter-client/src/defines/item.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { Iitem } from '@open-stock/stock-universal';
import { createMockItem, createMockItems } from '../../../../tests/stock-counter-mocks';

describe('Item', () => {
  let instance: Item;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockItem();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Item);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.numbersInstock).toBeDefined();
    expect(instance.name).toBeDefined();
    expect(instance.brand).toBeDefined();
    expect(instance.type).toBeDefined();
    expect(instance.category).toBeDefined();
    expect(instance.state).toBeDefined();
    expect(instance.photos).toBeDefined();
    expect(instance.colors).toBeDefined();
    expect(instance.model).toBeDefined();
    expect(instance.origin).toBeDefined();
    expect(instance.anyKnownProblems).toBeDefined();
    expect(instance.costMeta).toBeDefined();
    expect(instance.description).toBeDefined();
    expect(instance.numberBought).toBeDefined();
    expect(instance.sponsored).toBeDefined();
    expect(instance.buyerGuarantee).toBeDefined();
    expect(instance.reviewedBy).toBeDefined();
    expect(instance.reviewCount).toBeDefined();
    expect(instance.reviewWeight).toBeDefined();
    expect(instance.likes).toBeDefined();
    expect(instance.likesCount).toBeDefined();
    expect(instance.timesViewed).toBeDefined();
    expect(instance.inventoryMeta).toBeDefined();
  });

  it('#getItems static should get Items array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItems(10)));
    const list = await Item.getItems(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Item[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneItem static should get one Item', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockItem()));
    const one = await Item.getOneItem(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Item);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addItem static should add one Item', async() => {
    // const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const uploadSpy = vi.spyOn(StockCounterClient.ehttp, 'uploadFiles').mockImplementationOnce(() => of({ success: true }));
    const added = await Item.addItem(companyId, createMockItem() as unknown as Iitem, []);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(uploadSpy).toHaveBeenCalled();
  });

  it('#deleteItems static should delete many Items', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Item.deleteItems(companyId, ['ids'], ['filesWithDir'], 'url');
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateItem should update Item', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateItem(companyId, createMockItem(), 'all');
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteItem should delete Item', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteItem(companyId);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
