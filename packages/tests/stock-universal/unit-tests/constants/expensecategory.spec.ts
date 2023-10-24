import { expenseCategory } from '../../../../stock-universal/src/constants/expensecategory';
import { describe, it, expect } from 'vitest';

describe('expenseCategory', () => {
  it('should contain 14 expense categories', () => {
    expect(expenseCategory.length).toBeDefined();
  });

  it('should contain the category "advertising"', () => {
    expect(expenseCategory.includes('advertising')).toBe(true);
  });

  it('should contain the category "marketing"', () => {
    expect(expenseCategory.includes('marketing')).toBe(true);
  });

  it('should contain the category "software"', () => {
    expect(expenseCategory.includes('software')).toBe(true);
  });

  it('should contain the category "travel"', () => {
    expect(expenseCategory.includes('travel')).toBe(true);
  });

  it('should contain the category "utilities"', () => {
    expect(expenseCategory.includes('utilities')).toBe(true);
  });

  it('should contain the category "clothing"', () => {
    expect(expenseCategory.includes('clothing')).toBe(true);
  });

  it('should contain the category "drinks"', () => {
    expect(expenseCategory.includes('drinks')).toBe(true);
  });

  it('should contain the category "food"', () => {
    expect(expenseCategory.includes('food')).toBe(true);
  });

  it('should contain the category "transport"', () => {
    expect(expenseCategory.includes('transport')).toBe(true);
  });

  it('should contain the category "medical"', () => {
    expect(expenseCategory.includes('medical')).toBe(true);
  });

  it('should contain the category "insurance"', () => {
    expect(expenseCategory.includes('insurance')).toBe(true);
  });

  it('should contain the category "repairs"', () => {
    expect(expenseCategory.includes('repairs')).toBe(true);
  });

  it('should contain the category "rent"', () => {
    expect(expenseCategory.includes('rent')).toBe(true);
  });

  it('should contain the category "electricity"', () => {
    expect(expenseCategory.includes('electricity')).toBe(true);
  });

  it('should contain the category "internet"', () => {
    expect(expenseCategory.includes('internet')).toBe(true);
  });

  it('should contain the category "taxes"', () => {
    expect(expenseCategory.includes('taxes')).toBe(true);
  });

  it('should contain the category "petrol"', () => {
    expect(expenseCategory.includes('petrol')).toBe(true);
  });

  it('should contain the category "entertainment"', () => {
    expect(expenseCategory.includes('entertaiment')).toBe(true);
  });

  it('should contain the category "salaries"', () => {
    expect(expenseCategory.includes('salaries')).toBe(true);
  });

  it('should contain the category "debt"', () => {
    expect(expenseCategory.includes('debt')).toBe(true);
  });

  it('should contain the category "others"', () => {
    expect(expenseCategory.includes('others')).toBe(true);
  });

  it('should contain the category "petty"', () => {
    expect(expenseCategory.includes('petty')).toBe(true);
  });
});
