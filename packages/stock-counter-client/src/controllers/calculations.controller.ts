/** */
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]; // remember tis is manual and a better autou implementation is ewquired

/** */
export type TtypecalcReturn = 'fixed' | 'ceil' | 'floor' | 'float';

/** The above code defines a class called CalculationsController that contains various methods for performing calculations. It also exports a constant called monthNames, which is an array of month names. Additionally, it exports a type called TtypecalcReturn, which is a union of four possible string values.   */
/** */
/**
 * The CalculationsController class contains methods for performing various calculations.
 */
export class CalculationsController {
  constructor() { }

  /**
   * The toArray method takes a number and returns an array of that length, containing integers from 0 to length-1.
   * @param i The length of the array to be returned.
   * @returns An array of integers from 0 to i-1.
   */
  toArray(i: number) {
    return Array.from({ length: i })
      .map((val, index) => index);
  }

  /**
   * The formartDate method takes a Date object and returns a formatted string representing the date in the format "day month year".
   * @param date The date to be formatted.
   * @returns A string representing the date in the format "day month year".
   */
  formartDate(date: Date) {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  /**
   * The calculateFromDiscount method takes a price and a discount percentage, and returns the new price after applying the discount. It also takes an optional parameter called returnAs, which specifies how the result should be rounded or formatted. The method then returns the new price based on the specified format.
   * @param price The original price.
   * @param discount The discount percentage to be applied.
   * @param returnAs (Optional) Specifies how the result should be rounded or formatted. Defaults to 'fixed'.
   * @returns The new price after applying the discount, based on the specified format.
   */
  calculateFromDiscount(price: number, discount: number, returnAs: TtypecalcReturn = 'fixed') {
    price -= ((price * discount) / 100);
    switch (returnAs) {
      case 'fixed':
        return parseInt(price.toFixed(2), 10);
      case 'ceil':
        return parseInt(Math.ceil(price).toString(), 10);
      case 'floor':
        return parseInt(Math.floor(price).toString(), 10);
      case 'float':
        return parseFloat(Math.ceil(price).toString());
    }
  }

  /**
   * The restrictArrayToLength method takes an array and a number, and returns a new array containing only the first n elements of the original array, where n is the number passed as the second parameter.
   * @param data The original array.
   * @param restrictNoTo The number of elements to include in the new array.
   * @returns A new array containing only the first restrictNoTo elements of the original array.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restrictArrayToLength(data: any[], restrictNoTo: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data.filter((val, index) => index < restrictNoTo);
  }
}
