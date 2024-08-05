"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculationsController = exports.monthNames = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
/**
 * Array of month names.
 * @type {string[]}
 */
exports.monthNames = [
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
/** The above code defines a class called CalculationsController that contains various methods for performing calculations. It also exports a constant called monthNames, which is an array of month names. Additionally, it exports a type called TtypecalcReturn, which is a union of four possible string values.   */
/**
 * The CalculationsController class contains methods for performing various calculations.
 */
class CalculationsController {
    constructor() {
        this.logger = new stock_universal_1.LoggerController();
    }
    /**
     * The toArray method takes a number and returns an array of that length, containing integers from 0 to length-1.
     * @param i The length of the array to be returned.
     * @returns An array of integers from 0 to i-1.
     */
    toArray(i) {
        return Array.from({ length: i })
            .map((val, index) => index);
    }
    /**
     * The formartDate method takes a Date object and returns a formatted string representing the date in the format "day month year".
     * @param date The date to be formatted.
     * @returns A string representing the date in the format "day month year".
     */
    formartDate(date) {
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        return day + ' ' + exports.monthNames[monthIndex] + ' ' + year;
    }
    /**
     * The calculateFromDiscount method takes a price and a discount percentage, and returns the new price after applying the discount. It also takes an optional parameter called returnAs, which specifies how the result should be rounded or formatted. The method then returns the new price based on the specified format.
     * @param price The original price.
     * @param discount The discount percentage to be applied.
     * @param returnAs (Optional) Specifies how the result should be rounded or formatted. Defaults to 'fixed'.
     * @returns The new price after applying the discount, based on the specified format.
     */
    calculateFromDiscount(price, discount, returnAs = 'fixed') {
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
    restrictArrayToLength(data, restrictNoTo) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data.filter((val, index) => index < restrictNoTo);
    }
    /**
     * Determines the number of stars to display based on the given weight and where the stars should be displayed.
     * @param weight - The weight value to use for determining the number of stars.
     * @param where - Specifies where the stars should be displayed, such as 'full', 'half', or 'empty'.
     * @returns An array of the determined number of stars.
     */
    determineStars(weight, where) {
        let long;
        switch (where) {
            case 'full':
                long = Math.floor(weight / 2);
                break;
            case 'half':
                long = weight % 2 ? 1 : 0;
                break;
            case 'empty': {
                const left = 10 - weight;
                long = Math.ceil(left / 2);
                break;
            }
            default:
                long = 0;
                break;
        }
        return this.toArray(long);
    }
    /**
     * Checks if the dimensions of an image are within the allowed limits.
     * @param imageSrc - The source of the image.
     * @param alloweddimms - The allowed dimensions for the image.
     * @param expectedMaxSize - The expected maximum size of the image in bytes.
     * @returns A promise that resolves to an object containing the success status and any error message.
     */
    isAllowedDimensionsSize(imageSrc, alloweddimms, expectedMaxSize) {
        this.logger
            .debug(`imageSrc: ${imageSrc},
        alloweddimms: ${alloweddimms},
        expectedMaxSize: ${expectedMaxSize}`);
        return new Promise(resolve => {
            let fileError;
            let nowsuccess = true;
            const image = new Image();
            image.src = imageSrc;
            image.onload = rs => {
                const target = rs.currentTarget;
                if (expectedMaxSize) {
                    const imgSize = target.size;
                    if (imgSize > expectedMaxSize) {
                        nowsuccess = false;
                        fileError = 'max file size allowed is ' + expectedMaxSize / 1000000 + 'Mb';
                    }
                }
                const imgHeight = target.height;
                const imgWidth = target.width;
                if ((imgHeight > alloweddimms.maxHeight) ||
                    (imgWidth > alloweddimms.maxWidth)) {
                    fileError = 'max file dimmensions allowed is ' +
                        alloweddimms.maxHeight +
                        '*' + alloweddimms.maxWidth + 'px';
                    nowsuccess = false;
                }
                if ((imgHeight < alloweddimms.minHeight) ||
                    (imgWidth < alloweddimms.minWidth)) {
                    fileError = 'min file dimmensions allowed is ' +
                        alloweddimms.minHeight +
                        '*' + alloweddimms.minWidth + 'px';
                    nowsuccess = false;
                }
                resolve({
                    success: nowsuccess,
                    error: fileError
                });
            };
        });
    }
    /**
     * Calculates the tax value from the given subTotal and tax rate.
     * @param subTotal - The subTotal amount.
     * @param tax - The tax rate percentage.
     * @returns The tax value.
     */
    taxValFromSubTotal(subTotal, tax) {
        return (tax / 100) * subTotal;
    }
    /**
     * Converts the given amount using the provided exchange rate.
     * @param amount - The amount to be converted.
     * @param rate - The exchange rate to use for the conversion.
     * @returns The converted amount.
     */
    convertCurrency(amount, rate) {
        return amount * rate;
    }
}
exports.CalculationsController = CalculationsController;
//# sourceMappingURL=calculations.controller.js.map