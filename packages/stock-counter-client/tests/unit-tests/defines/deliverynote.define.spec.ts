/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { DeliveryNote } from '../../../../stock-counter-client/src/defines/deliverynote.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockDeliverynote, createMockDeliverynotes } from '../../../../tests/stock-counter-mocks';

describe('Environment', () => {
  let instance: DeliveryNote;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockDeliverynote();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(DeliveryNote);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
  });

  it('#getDeliveryNotes static should get DeliveryNotes array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliverynotes(10)));
    const list = await DeliveryNote.getDeliveryNotes(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<DeliveryNote[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneDeliveryNote static should get one DeliveryNote', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockDeliverynote()));
    const one = await DeliveryNote.getOneDeliveryNote(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(DeliveryNote);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addDeliveryNote static should add one DeliveryNote', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await DeliveryNote.addDeliveryNote(companyId, createMockDeliverynote());
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteDeliveryNotes static should delete many DeliveryNotes', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await DeliveryNote.deleteDeliveryNotes(companyId, []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
