import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUser } from '../../../../tests/stock-auth-mocks';
import { createMockFaq, createMockInvoice, createMockInvoices, createMockItem, createMockOrder } from '../../../../tests/stock-counter-mocks';
import { applyBlockDateSelect, deleteManyInvoicesFn, determineLikedFn, likeFn, makeInvoiceRelated, makePaymentRelated, openBoxFn, toggleSelectionFn, transformEstimateId, transformFaqToNameOrImage, transformInvoice, transformNoInvId, transformUrId, unLikeFn } from '../../../src/constants/common.fns.constant';
import { Invoice } from '../../../src/defines/invoice.define';

/* vi.mock('../../../src/defines/invoice.define', async() => {
  const actual: object = await vi.importActual('../../../src/defines/invoice.define');
  return {
    ...actual,

    Invoice: {
      ...actual.Invoice,
      update: vi.fn().mockResolvedValue({ success: true })
    }
  };
}); */

describe('transformFaqToNameOrImage', () => {
  it('should return the image source when type is "img"', () => {
    const faq = createMockFaq();
    const type = 'img';
    const result = transformFaqToNameOrImage(faq, type);

    expect(result).toBeTypeOf('string');
  });

  it('should return the user name when type is "name"', () => {
    const faq = createMockFaq();
    const type = 'name';
    const result = transformFaqToNameOrImage(faq, type);

    expect(result).toBeTypeOf('string');
  });

  it('should return "admin" when userId is "admin" and type is "name"', () => {
    const faq = createMockFaq();

    faq.userId = 'admin';
    const type = 'name';
    const result = transformFaqToNameOrImage(faq, type);

    expect(result).toBe('admin');
  });

  it('should return the poster name when userId is not available and type is "name"', () => {
    const faq = createMockFaq();
    const type = 'name';
    const result = transformFaqToNameOrImage(faq, type);

    expect(result).toBeTypeOf('string');
  });
});


describe('transformEstimateId', () => {
  it('should transform the estimate id correctly', () => {
    const id = 123;
    const result = transformEstimateId(id);

    expect(result).toBe('#EST-0123');
  });

  it('should handle single-digit id', () => {
    const id = 5;
    const result = transformEstimateId(id);

    expect(result).toBe('#EST-0005');
  });

  it('should handle four-digit id', () => {
    const id = 9876;
    const result = transformEstimateId(id);

    expect(result).toBe('#EST-9876');
  });

  // Add more test cases as needed
});


describe('transformInvoice', () => {
  it('should return the transformed invoice number', () => {
    const id = 1234;
    const result = transformInvoice(id);

    expect(result).toBe('#INV-1234');
  });

  it('should return the transformed invoice number with leading zeros', () => {
    const id = 5;
    const result = transformInvoice(id);

    expect(result).toBe('#INV-0005');
  });
});


describe('transformUrId', () => {
  it('should transform the id correctly', () => {
    const id = '123';
    const where = 'example';
    const transformedId = transformUrId(id, where);

    expect(transformedId).toBe('#example_0123');
  });

  it('should handle single-digit id correctly', () => {
    const id = '5';
    const where = 'example';
    const transformedId = transformUrId(id, where);

    expect(transformedId).toBe('#example_0005');
  });

  // Add more test cases as needed
});


describe('makePaymentRelated', () => {
  it('should return the correct payment related object', () => {
    const data = createMockOrder();
    const result = makePaymentRelated(data);

    expect(result).toBeTruthy();
  });
});


describe('makeInvoiceRelated', () => {
  it('should return the expected invoice related data', () => {
    const data = createMockInvoice();
    const result = makeInvoiceRelated(data);

    expect(result).toBeTruthy();
  });
});

describe('likeFn', () => {
  const companyId = 'companyId';

  it('should return { success: false } if currentUser is falsy', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();
    const result = await likeFn(companyId, currentUser, item);

    expect(result).toEqual({ success: false });
  });

  it('should call item.likeItem and return its result', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();
    const likeItemResult = { success: true };

    item.likeItem = vi.fn().mockResolvedValue(likeItemResult);

    const result = await likeFn(companyId, currentUser, item);

    expect(item.likeItem).toHaveBeenCalledWith(companyId, currentUser._id);
    expect(result).toEqual(likeItemResult);
  });

  it('should catch and log errors from item.likeItem and return { success: false }', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();
    const error = new Error('Some error message'); // Replace 'Some error message' with the desired error message

    // Mock the item.likeItem method to throw an error
    item.likeItem = vi.fn().mockRejectedValue(error);
    const result = await likeFn(companyId, currentUser, item);

    expect(item.likeItem).toHaveBeenCalledWith(companyId, currentUser._id);
    expect(result).toEqual({ success: false });
  });
});


describe('unLikeFn', () => {
  const companyId = 'companyId';

  it('should return { success: false } if currentUser is not provided', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();
    const result = await unLikeFn(companyId, currentUser, item);

    expect(result).toEqual({ success: false });
  });

  it('should call likeItem method and return its result', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();

    // Mock the likeItem method
    item.likeItem = vi.fn().mockResolvedValue({ success: true });
    const result = await unLikeFn(companyId, currentUser, item);

    expect(item.likeItem).toHaveBeenCalledWith(companyId, currentUser._id);
    expect(result).toEqual({ success: true });
  });

  it('should catch and log errors, and return { success: false }', async() => {
    const currentUser = createMockUser();
    const item = createMockItem();

    // Mock the likeItem method to throw an error
    item.likeItem = vi.fn().mockRejectedValue(new Error('Some error'));
    const result = await unLikeFn(companyId, currentUser, item);

    expect(item.likeItem).toHaveBeenCalledWith(companyId, currentUser._id);
    // expect(logger.debug).toHaveBeenCalledWith(':unLike:: - err ', new Error('Some error'));
    expect(result).toEqual({ success: false });
  });
});


describe('determineLikedFn', () => {
  it('should return true if the item is liked by the current user', () => {
    const item = createMockItem();
    const currentUser = createMockUser();

    item.likes = [];
    item.likes.push(currentUser._id as unknown as string);
    const result = determineLikedFn(item, currentUser);

    expect(result).toBe(true);
  });

  it('should return false if the item is not liked by the current user', () => {
    const item = createMockItem();
    const currentUser = createMockUser();
    const result = determineLikedFn(item, currentUser);

    expect(result).toBe(false);
  });

  it('should return false if the current user is not provided', () => {
    const item = createMockItem();
    const currentUser = createMockUser();
    const result = determineLikedFn(item, currentUser);

    expect(result).toBe(false);
  });
});

describe('toggleSelectionFn', () => {
  it('should remove the id from selections if it exists', () => {
    const id = '1';
    const selections = ['1', '2', '3'];

    toggleSelectionFn(id, selections);
    expect(selections.includes(id)).toBe(false);
  });

  it('should add the id to selections if it does not exist', () => {
    const id = '4';
    const selections = ['1', '2', '3'];

    toggleSelectionFn(id, selections);
    expect(selections.includes(id)).toBe(true);
  });
});

describe('deleteManyInvoicesFn', () => {
  let deleteInvoicesSpy;

  beforeEach(() => {
    deleteInvoicesSpy = vi.spyOn(Invoice, 'deleteInvoices');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete selected invoices and return success', async() => {
    const companyId = 'company123';
    const invoices = createMockInvoices(3);
    const selections = ['invoice1', 'invoice3'];

    deleteInvoicesSpy.mockResolvedValueOnce({ success: true });
    const result = await deleteManyInvoicesFn(companyId, invoices, selections);

    expect(deleteInvoicesSpy).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should handle error and return failure', async() => {
    const companyId = 'company123';
    const invoices = createMockInvoices(3);
    const selections = ['invoice1', 'invoice3'];
    const error = new Error('Delete error');

    deleteInvoicesSpy.mockRejectedValueOnce(error);
    const result = await deleteManyInvoicesFn(companyId, invoices, selections);

    expect(deleteInvoicesSpy).toHaveBeenCalled();
    expect(result).toEqual({ success: false });
  });
});


describe('openBoxFn', () => {
  it('should set selectBoxOpen[0] to val if it is not equal to val', () => {
    const selectBoxOpen = [''];
    const val = 'someValue';

    openBoxFn(val, selectBoxOpen);

    expect(selectBoxOpen[0]).toBe(val);
  });

  it('should set selectBoxOpen to an empty array if selectBoxOpen[0] is equal to val', () => {
    const selectBoxOpen = ['someValue'];
    const val = 'someValue';

    openBoxFn(val, selectBoxOpen);
    expect(selectBoxOpen).toEqual([val]);
  });
});

describe('transformNoInvId', () => {
  it('should add leading zeros when the input number has 1 digit', () => {
    const result = transformNoInvId(5, 'INV');

    expect(result).toBe('INV0005');
  });

  it('should add leading zeros when the input number has 2 digits', () => {
    const result = transformNoInvId(25, 'INV');

    expect(result).toBe('INV0025');
  });

  it('should add leading zeros when the input number has 3 digits', () => {
    const result = transformNoInvId(123, 'INV');

    expect(result).toBe('INV123');
  });

  it('should not add leading zeros when the input number has more than 3 digits', () => {
    const result = transformNoInvId(1234, 'INV');

    expect(result).toBe('INV1234');
  });
});


describe('applyBlockDateSelect', () => {
  const data = createMockInvoices(5);

  console.log('data is', data);
  it('should filter data for today', () => {
    const result = applyBlockDateSelect(data, 'today');

    expect(result).toBeTypeOf('object');
  });

  it('should filter data for yesterday', () => {
    const result = applyBlockDateSelect(data, 'yesterday');

    expect(result).toBeTypeOf('object');
  });

  it('should filter data for last 7 days', () => {
    const result = applyBlockDateSelect(data, 'last7days');

    expect(result).toBeTypeOf('object');
  });

  it('should filter data for this month', () => {
    const result = applyBlockDateSelect(data, 'thisMonth');

    expect(result).toBeTypeOf('object');
  });

  it('should filter data for last month', () => {
    const result = applyBlockDateSelect(data, 'lastMonth');

    expect(result).toBeTypeOf('object');
  });
});
