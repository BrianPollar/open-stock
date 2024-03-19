import { LoggerController } from '@open-stock/stock-universal';
/**
 * Represents the response object for image size calculations.
 */
export interface Iimagesizeresponse {
    success: boolean;
    error: string;
}
/**
 * Interface representing the allowed dimensions for a calculation.
 */
export interface Ialloweddimms {
    maxHeight: number;
    maxWidth: number;
    minHeight: number;
    minWidth: number;
}
/**
 * Represents the target for the Iev calculation.
 */
export interface IevTarget {
    size: number;
    height: number;
    width: number;
    result: any;
}
/**
 * Array of month names.
 * @type {string[]}
 */
export declare const monthNames: string[];
/**
 * Represents the return type for the calculation function.
 * It can be one of the following values: 'fixed', 'ceil', 'floor', 'float'.
 */
export type TtypecalcReturn = 'fixed' | 'ceil' | 'floor' | 'float';
/** The above code defines a class called CalculationsController that contains various methods for performing calculations. It also exports a constant called monthNames, which is an array of month names. Additionally, it exports a type called TtypecalcReturn, which is a union of four possible string values.   */
/**
 * The CalculationsController class contains methods for performing various calculations.
 */
export declare class CalculationsController {
    logger: LoggerController;
    constructor();
    /**
     * The toArray method takes a number and returns an array of that length, containing integers from 0 to length-1.
     * @param i The length of the array to be returned.
     * @returns An array of integers from 0 to i-1.
     */
    toArray(i: number): number[];
    /**
     * The formartDate method takes a Date object and returns a formatted string representing the date in the format "day month year".
     * @param date The date to be formatted.
     * @returns A string representing the date in the format "day month year".
     */
    formartDate(date: Date): string;
    /**
     * The calculateFromDiscount method takes a price and a discount percentage, and returns the new price after applying the discount. It also takes an optional parameter called returnAs, which specifies how the result should be rounded or formatted. The method then returns the new price based on the specified format.
     * @param price The original price.
     * @param discount The discount percentage to be applied.
     * @param returnAs (Optional) Specifies how the result should be rounded or formatted. Defaults to 'fixed'.
     * @returns The new price after applying the discount, based on the specified format.
     */
    calculateFromDiscount(price: number, discount: number, returnAs?: TtypecalcReturn): number;
    /**
     * The restrictArrayToLength method takes an array and a number, and returns a new array containing only the first n elements of the original array, where n is the number passed as the second parameter.
     * @param data The original array.
     * @param restrictNoTo The number of elements to include in the new array.
     * @returns A new array containing only the first restrictNoTo elements of the original array.
     */
    restrictArrayToLength(data: unknown[], restrictNoTo: number): unknown[];
    determineStars(weight: number, where: string): number[];
    /**
     * Checks if the dimensions of an image are within the allowed limits.
     * @param imageSrc - The source of the image.
     * @param alloweddimms - The allowed dimensions for the image.
     * @param expectedMaxSize - The expected maximum size of the image in bytes.
     * @returns A promise that resolves to an object containing the success status and any error message.
     */
    isAllowedDimensionsSize(imageSrc: string, alloweddimms: Ialloweddimms, expectedMaxSize?: number): Promise<Iimagesizeresponse>;
    /**
     * Calculates the tax value from the given subTotal and tax rate.
     * @param subTotal - The subTotal amount.
     * @param tax - The tax rate percentage.
     * @returns The tax value.
     */
    taxValFromSubTotal(subTotal: number, tax: number): number;
}
