import { Ifaq } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Faq } from '../../../../stock-counter-client/src/defines/faq.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { createMockFaq, createMockFaqs } from '../../../../tests/stock-counter-mocks';

describe('Faq', () => {
  let instance: Faq;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockFaq();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });


  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Faq);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.posterName).toBeDefined();
    expect(instance.posterEmail).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.qn).toBeDefined();
    expect(instance.approved).toBeDefined();
  });

  it('should have props undefined', () => {
    expect(instance.ans).toBeUndefined();
  });

  it('#getFaqs static should get Faqs array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockFaqs(10)));
    const list = await Faq.getFaqs(companyId, '/', 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Faq[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOnefaq static should get one Faq', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockFaq()));
    const one = await Faq.getOnefaq(companyId, 'urId');

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Faq);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createfaq static should add one Faq', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Faq.createfaq(companyId, createMockFaq() as Ifaq);

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteFaqs static should delete many Faqs', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Faq.deleteFaqs(companyId, ['_ids']);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#changeApproved should approve faq', async() => {
    // const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const lpostSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.changeApproved(companyId, true);

    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    // expect(lSpy).toHaveBeenCalled();
    expect(lpostSpy).toHaveBeenCalled();
  });

  it('#deleteFaq should delete Faq', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteFaq(companyId);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
