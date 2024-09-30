import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { InvoiceSettings } from '../../../../../stock-counter-client/src/defines/settings/invoicesetting.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { createMockInvoiceSettings } from '../../../../../tests/stock-counter-mocks';

describe('InvoiceSettings', () => {
  let instance: InvoiceSettings;
  const axiosMock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn().mockImplementation(() => of({ success: true })),
    delete: vi.fn()
  } as unknown as Axios;
  const companyId = 'companyId';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockInvoiceSettings();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(InvoiceSettings);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.generalSettings).toBeDefined();
    expect(instance.taxSettings).toBeDefined();
    expect(instance.bankSettings).toBeDefined();
  });

  it('#getInvoiceSettings static should get InvoiceSettings array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of([createMockInvoiceSettings()]));
    const list = await InvoiceSettings.getInvoiceSettings(companyId, 'getall', 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<InvoiceSettings[]>([]);
    expect(lSpy).toHaveBeenCalledWith('/invoicesettings/all/0/0/companyId');
  });

  it('#getOneInvoiceSettings static should get one InvoiceSettings', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoiceSettings()));
    const one = await InvoiceSettings.getOneInvoiceSettings(companyId, 'urId');

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(InvoiceSettings);
    expect(lSpy).toHaveBeenCalledWith('/invoicesettings/one/urId');
  });

  it('#addInvoiceSettings static should add one InvoiceSettings', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await InvoiceSettings.addInvoiceSettings(companyId, createMockInvoiceSettings());

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteInvoiceSettings static should delete many InvoiceSettings', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await InvoiceSettings.deleteInvoiceSettings(companyId, ['_ids']);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalledWith('/invoicesettings/delete/many/companyId', { _ids: ['_ids'] });
  });
});
