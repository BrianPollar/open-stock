import { expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { InventoryController } from '../../../../stock-counter-client/src/controllers/inventory.controller';
import {
  createMockPayments,
  createMockExpenses,
  createMockEstimates,
  createMockInvoice, createMockInvoiceRelatedPdct, createMockInvoiceRelatedPdcts, createMockInvoiceRelateds, createMockInvoices
} from '../../../../tests/mocks';
import { createMockItem, createMockItems } from '../../../../tests/mocks';
import { Expense } from '../../../../stock-counter-client/src/defines/expense.define';
import { Item } from '../../../../stock-counter-client/src/defines/item.define';

describe('InventoryController', () => {
  let instance: InventoryController;

  beforeEach(() => {
    instance = new InventoryController();
  });

  it('its real instance of InventoryController', () => {
    expect(instance).toBeInstanceOf(InventoryController);
  });

  it('should have an empty constructor', () => {
    expect(instance.constructor).toBeDefined();
  });

  it('#stageRelegator should return true if the stages are equal', () => {
    const relegated = instance.stageRelegator('estimate', 'estimate');
    expect(relegated).toBe(true);
    // expect(typeof relegated).toBe('boolen');
    expectTypeOf(relegated).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#stageRelegator should return true if current stage is less than stage', () => {
    const relegated = instance.stageRelegator('estimate', 'invoice');
    expect(relegated).toBe(true);
    expect(typeof relegated).toBe('boolean');
    expectTypeOf(relegated).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#stageRelegator should return false if current stage is greater than stage', () => {
    const relegated = instance.stageRelegator('deliverynote', 'estimate');
    expect(relegated).toBe(false);
    expect(typeof relegated).toBe('boolean');
    expectTypeOf(relegated).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#itemExistInRelatedPdct should return false if item does exist in IinvoiceRelatedPdct', () => {
    const relatedPdct = createMockInvoiceRelatedPdct();
    const notExist = instance.itemExistInRelatedPdct('id1', relatedPdct);
    expect(notExist).toBe(false);
    expect(typeof notExist).toBe('boolean');
    expectTypeOf(notExist).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#itemExistInRelatedPdct should return true if item exist in IinvoiceRelatedPdct', () => {
    const relatedPdct = createMockInvoiceRelatedPdct();
    relatedPdct.item = 'id1';
    const exist = instance.itemExistInRelatedPdct(relatedPdct.item, relatedPdct);
    expect(exist).toBe(true);
    expect(typeof exist).toBe('boolean');
    expectTypeOf(exist).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#calcBulkProfitMarginPdts should return profit margin from items', () => {
    const items = createMockItems(10);
    const calculated = instance.calcBulkProfitMarginPdts(items);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#calcItemProfitMargin should return profit margin from item', () => {
    const item = createMockItem();
    const calculated = instance.calcItemProfitMargin(item);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#calcBigExpensePoint should return whic expece is the largest', () => {
    const expenses = createMockExpenses(10);
    const calculated = instance.calcBigExpensePoint(expenses);
    expect(calculated).toBeInstanceOf(Expense);
  });

  it('#calcSubtotal should return sub total from IinvoiceRelatedPdct', () => {
    const relatedPdcts = createMockInvoiceRelatedPdcts(10);
    const calculated = instance.calcSubtotal(relatedPdcts);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#calcBalanceDue should return calculate balance due from Invoice', () => {
    const invoice = createMockInvoice();
    const calculated = instance.calcBalanceDue(invoice);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#calcTotal should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const relatedPdcts = createMockInvoiceRelatedPdcts(10);
    const calculated = instance.calcTotal(relatedPdcts, 10);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#getAllItemsProfit should return number cost for profites made in atime period', () => {
    const related = createMockInvoiceRelateds(10);
    const items = createMockItems(10);
    const calculated = instance.getAllItemsProfit(related, items);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#findItem should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const items = createMockItems(10);
    const found = instance.findItem('id1', items);
    if (found) {
      expect(found).toBeInstanceOf(Item);
    }
  });

  it('#findItem should return true if item exists in IinvoiceRelatedPdct', () => {
    const items = createMockItems(10);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const calculated = instance.findItem(items[0]._id as string, items);
    expect(calculated).toBeInstanceOf(Item);
  });

  it('#getProfitByItem should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const payments = createMockPayments(10);
    const items = createMockItems(10);
    const calculated = instance.getProfitByItem('1d1', payments, items);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#getExpenseByItem should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const item = createMockItem();
    const calculated = instance.getExpenseByItem(item);
    expect(typeof calculated).toBe('number');
    expectTypeOf(calculated).toEqualTypeOf<number>(Number('true'));
  });

  it('#deepDateComparison should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const otherDate = new Date();
    const returned = instance.deepDateComparison(date, otherDate, 'year');
    expect(returned).toHaveProperty('equal');
    expect(returned).toHaveProperty('lessThan');
    expect(returned).toHaveProperty('moreThan');
    expect(typeof returned).toBe('object');
    expectTypeOf(returned.equal).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#getExpenseByDay should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const expenses = createMockExpenses(10);
    const returned = instance.getExpenseByDay(expenses, date);
    expect(returned).toHaveProperty('expenses');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.expenses).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getExpenseByWeek should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const expenses = createMockExpenses(10);
    const returned = instance.getExpenseByWeek(expenses, date);
    expect(returned).toHaveProperty('expenses');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.expenses).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getExpenseByMonth should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const expenses = createMockExpenses(10);
    const returned = instance.getExpenseByMonth(expenses, date);
    expect(returned).toHaveProperty('expenses');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.expenses).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getExpenseByYear should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const expenses = createMockExpenses(10);
    const returned = instance.getExpenseByYear(expenses, date);
    expect(returned).toHaveProperty('expenses');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.expenses).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getExpenseByDates should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const lowerDate = new Date();
    const upperDate = new Date();
    const expenses = createMockExpenses(10);
    const returned = instance.getExpenseByDates(expenses, lowerDate, upperDate);
    expect(returned).toHaveProperty('expenses');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.expenses).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getSalesByDay should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const relateds = createMockInvoiceRelateds(10);
    const returned = instance.getSalesByDay(relateds, date);
    expect(returned).toHaveProperty('sales');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.sales).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getSalesByWeek should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const relateds = createMockInvoiceRelateds(10);
    const returned = instance.getSalesByWeek(relateds, date);
    expect(returned).toHaveProperty('sales');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.sales).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getSalesByMonth should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const relateds = createMockInvoiceRelateds(10);
    const returned = instance.getSalesByMonth(relateds, date);
    expect(returned).toHaveProperty('sales');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.sales).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getSalesByYear should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const relateds = createMockInvoiceRelateds(10);
    const returned = instance.getSalesByYear(relateds, date);
    expect(returned).toHaveProperty('sales');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.sales).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getSalesByDates should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const lowerDate = new Date();
    const upperDate = new Date();
    const relateds = createMockInvoiceRelateds(10);
    const returned = instance.getSalesByDates(relateds, lowerDate, upperDate);
    expect(returned).toHaveProperty('sales');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.sales).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getInvoicesByDay should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const invoices = createMockInvoices(10);
    const returned = instance.getInvoicesByDay(invoices, date);
    expect(returned).toHaveProperty('invoices');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.invoices).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getInvoicesByWeek should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const invoices = createMockInvoices(10);
    const returned = instance.getInvoicesByWeek(invoices, date);
    expect(returned).toHaveProperty('invoices');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.invoices).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getInvoicesByMonth should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const invoices = createMockInvoices(10);
    const returned = instance.getInvoicesByMonth(invoices, date);
    expect(returned).toHaveProperty('invoices');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.invoices).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getInvoicesYear should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const invoices = createMockInvoices(10);
    const returned = instance.getInvoicesYear(invoices, date);
    expect(returned).toHaveProperty('invoices');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.invoices).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getInvoicesByDates should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const lowerDate = new Date();
    const upperDate = new Date();
    const invoices = createMockInvoices(10);
    const returned = instance.getInvoicesByDates(invoices, lowerDate, upperDate);
    expect(returned).toHaveProperty('invoices');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.invoices).toBe('object');
    expect(typeof returned.total).toBe('number');
  });

  it('#getEstimatesByMonth should return false if item deoes not exists in IinvoiceRelatedPdct', () => {
    const date = new Date();
    const estimates = createMockEstimates(10);
    const returned = instance.getEstimatesByMonth(estimates, date);
    expect(returned).toHaveProperty('estimates');
    expect(returned).toHaveProperty('total');
    expect(typeof returned.estimates).toBe('object');
    expect(typeof returned.total).toBe('number');
  });
});
