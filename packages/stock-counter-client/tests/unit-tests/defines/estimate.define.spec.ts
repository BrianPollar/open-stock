import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { Estimate } from '../../../../stock-counter-client/src/defines/estimate.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockInvoiceRelated, createMockEstimate, createMockEstimates } from '../../../../tests/stock-counter-mocks';

describe('Estimate', () => {
  let instance: Estimate;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockEstimate();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Estimate);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.fromDate).toBeDefined();
    expect(instance.toDate).toBeDefined();
  });

  it('#getEstimates static should get Estimates array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockEstimates(10)));
    const list = await Estimate.getEstimates(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Estimate[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneEstimate static should get one Estimate', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockEstimate()));
    const one = await Estimate.getOneEstimate(companyId, 1);
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Estimate);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addEstimate static should add one Estimate', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Estimate.addEstimate(companyId, createMockEstimate(), createMockInvoiceRelated());
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteEstimates static should delete many Estimates', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Estimate.deleteEstimates(companyId, []);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateEstimatePdt should update estimate product', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateEstimatePdt(companyId, createMockInvoiceRelated());
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
