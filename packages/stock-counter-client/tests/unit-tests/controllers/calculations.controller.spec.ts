import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { CalculationsController, monthNames } from '../../../../stock-counter-client/src/controllers/calculations.controller';

const isInt = (n) => Number(n) === n && n % 1 === 0;

/*
const isFloat = (n) => {
  return Number(n) === n && n % 1 !== 0;
};
*/

describe('CalculationsController', () => {
  let instance: CalculationsController;

  beforeEach(() => {
    instance = new CalculationsController();
  });

  it('its real instance of CalculationsController', () => {
    expect(instance).toBeInstanceOf(CalculationsController);
  });

  it('should have an constructor', () => {
    expect(instance.constructor).toBeDefined();
  });

  it('#toArray should return an array', () => {
    const arrayLong = instance.toArray(4);

    expect(typeof arrayLong).toBe('object');
    expect(arrayLong).toBeInstanceOf(Array);
    expectTypeOf(arrayLong).toEqualTypeOf<number[]>([]);
  });

  it('#toArray should return array of length', () => {
    expect(instance.toArray(4).length).toBe(4);
  });

  it('#formartDate should formart and return date in day-month-year format as a string', () => {
    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const localformat = day + ' ' + monthNames[monthIndex] + ' ' + year;
    const formarted = instance.formartDate(date);

    expect(formarted).toBe(localformat);
    expect(typeof formarted).toBe('string');
    expectTypeOf(formarted).toEqualTypeOf<string>(String('string here'));
  });

  it('#formartDate should be able to format a date ', () => {
    // const date = new Date();
    // const formattedDate = instance.formartDate(date);
    // expect(formattedDate).toBe('1 ' + monthNames[date.getMonth()] + ' ' + date.getFullYear());
  });

  it('#calculateFromDiscount should return discounted price as a number', () => {
    const discounted = instance.calculateFromDiscount(100, 1);

    expect(discounted).toBe(100 - 1);
    expect(typeof discounted).toBe('number');
    expectTypeOf(discounted).toEqualTypeOf<number>(Number('1'));
    expect(isInt(discounted)).toBe(true);
  });

  it('#calculateFromDiscount should be able to calculate a discounted price', () => {
    const price = 100;
    const discount = 10;
    const discountedPrice = instance.calculateFromDiscount(price, discount);

    expect(discountedPrice).toBe(90);
    expect(typeof discountedPrice).toBe('number');
  });

  it('#calculateFromDiscount should return afloat', () => {
    const price = 100;
    const discount = 10;
    const discountedPrice = instance.calculateFromDiscount(price, discount, 'float');

    expect(typeof discountedPrice).toBe('number');
  });

  it('#calculateFromDiscount should be able to calculate a discounted price', () => {
    const price = 100;
    const discount = 10;
    const discountedPrice = instance.calculateFromDiscount(price, discount);

    expect(discountedPrice).toBe(90);
  });

  it('#restrictArrayToLength should be able to restrict an array to a given length', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const restrictedData = instance.restrictArrayToLength(data, 5);

    expect(restrictedData.length).toBe(5);
    for (let i = 0; i < restrictedData.length; i++) {
      expect(restrictedData[i]).toBe(data[i]);
    }
  });

  it('#determineStars should return an array of stars based on weight and where', () => {
    const weight = 5;
    const where = 'full';
    const stars = instance.determineStars(weight, where);

    expect(stars).toEqual([0, 1]);
  });

  it('#taxValFromSubTotal should return the tax value based on the subTotal and tax percentage', () => {
    const subTotal = 100;
    const tax = 10;
    const taxValue = instance.taxValFromSubTotal(subTotal, tax);

    expect(taxValue).toBe(10);
  });
});

