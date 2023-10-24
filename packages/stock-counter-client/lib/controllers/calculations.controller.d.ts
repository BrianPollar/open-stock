/** */
export declare const monthNames: string[];
/** */
export type TtypecalcReturn = 'fixed' | 'ceil' | 'floor' | 'float';
/** The above code defines a class called CalculationsController that contains various methods for performing calculations. It also exports a constant called monthNames, which is an array of month names. Additionally, it exports a type called TtypecalcReturn, which is a union of four possible string values.   */
/** */
export declare class CalculationsController {
    constructor();
    /**  The toArray method takes a number and returns an array of that length, containing integers from 0 to length-1.  */
    toArray(i: number): number[];
    /** The formartDate method takes a Date object and returns a formatted string representing the date in the format "day month year".   */
    formartDate(date: Date): string;
    /** The calculateFromDiscount method takes a price and a discount percentage, and returns the new price after applying the discount. It also takes an optional parameter called returnAs, which specifies how the result should be rounded or formatted. The method then returns the new price based on the specified format.  */
    calculateFromDiscount(price: number, discount: number, returnAs?: TtypecalcReturn): number;
    /** The restrictArrayToLength method takes an array and a number, and returns a new array containing only the first n elements of the original array, where n is the number passed as the second parameter.   */
    restrictArrayToLength(data: any[], restrictNoTo: number): any[];
}
