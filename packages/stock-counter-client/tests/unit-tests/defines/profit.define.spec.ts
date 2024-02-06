import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Profit } from '../../../../stock-counter-client/src/defines/profit.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { Iprofit } from '@open-stock/stock-universal';
import { createMockProfit, createMockProfits } from '../../../../tests/stock-counter-mocks';

describe('Profit', () => {
  let instance: Profit;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockProfit();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Profit);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.margin).toBeDefined();
    expect(instance.origCost).toBeDefined();
    expect(instance.soldAtPrice).toBeDefined();
  });

  it('#getProfits static should get Profits array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockProfits(10)));
    const list = await Profit.getProfits(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Profit[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneProfit static should get one Profit', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockProfit()));
    const one = await Profit.getOneProfit(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Profit);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addProfit static should add one Profit', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Profit.addProfit(companyId, createMockProfit() as Iprofit);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteProfits static should delete many Profits', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Profit.deleteProfits(companyId, ['ids'], ['filesWithDir'], '/');
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateProfit should update Profit', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateProfit(companyId, createMockProfit());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
