import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { InvoiceSettings } from '../../../../../stock-counter-client/src/defines/settings/invoicesetting.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockInvoiceSettings } from '../../../../../tests/mocks';

describe('Environment', () => {
  let instance: InvoiceSettings;
  const axiosMock = { } as Axios;

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockInvoiceSettings();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
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

  it('#getInvoiceSettings static should get InvoiceSettingss array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of([createMockInvoiceSettings()]));
    const list = await InvoiceSettings.getInvoiceSettings('/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<InvoiceSettings[]>([]);
  });

  it('#getOneInvoiceSettings static should get one InvoiceSettings', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockInvoiceSettings()));
    const one = await InvoiceSettings.getOneInvoiceSettings('urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(InvoiceSettings);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addInvoiceSettings static should add one InvoiceSettings', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const added = await InvoiceSettings.addInvoiceSettings(createMockInvoiceSettings() as any);
    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteInvoiceSettings static should delete many InvoiceSettingss', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await InvoiceSettings.deleteInvoiceSettings(['ids']);
    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});


