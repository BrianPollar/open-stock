import { IreviewMain } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Review } from '../../../../stock-counter-client/src/defines/review.define';
import { StockCounterClient } from '../../../../stock-counter-client/src/stock-counter-client';
import { createMockReview, createMockReviews } from '../../../../tests/stock-counter-mocks';

describe('Review', () => {
  let instance: Review;
  const axiosMock = { } as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockReview();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Review);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    // expect(instance.image).toBeDefined();
    expect(instance.name).toBeDefined();
    expect(instance.email).toBeDefined();
    expect(instance.comment).toBeDefined();
    expect(instance.rating).toBeDefined();
    expect(instance.images).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.itemId).toBeDefined();
  });

  it('#getreviews static should get Reviews array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockReviews(10)));
    const list = await Review.getreviews(companyId, 'uriD', '/', 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Review[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOnereview static should get one Review', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockReview()));
    const one = await Review.getOnereview(companyId, 'urId');

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Review);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createreview static should add one Review', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Review.createreview(companyId, createMockReview() as IreviewMain);

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteReview should delete Review', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeDelete').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteReview(companyId);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
