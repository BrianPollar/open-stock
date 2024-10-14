import { Iaddress, Icart, IpromoCode } from '@open-stock/stock-universal';
import { DeliveryCity } from '../defines/delivery.define';
/**
 * The PaymentController class is responsible for handling payment-related operations.
 * It has the following methods:
 */
export declare class PaymentController {
    /** The current delivery city */
    currentCity?: DeliveryCity;
    constructor();
    /**
     * Calculates the total cost or shipping cost based on the parameters provided.
     * It iterates over the items in the cart and calculates the cost based on the item's rate and quantity.
     * If a promo code is provided, it applies the discount to the items specified in the promo code.
     * The method returns the total cost, total shipping, and the final result.
     * @param isShipping - A boolean indicating whether the calculation is for shipping or not.
     * @param data - An array of Icart objects representing the items in the cart.
     * @param city - The DeliveryCity object representing the current delivery city.
     * @param promoCode - The IpromoCode object representing the promo code applied to the cart.
     * @returns An object containing the total cost, total shipping, and the final result.
     */
    calculateTargetPriceOrShipping(isShipping: boolean, data: Icart[], city: DeliveryCity, promoCode: IpromoCode | null): {
        totalCost: number;
        totalShipping: number;
        res: number;
    };
    /**
     * Calculates the total cost, total shipping, quantity, and tax value based on the parameters provided.
     * It calls the calculateTargetPriceOrShipping method to calculate the total cost and total shipping separately.
     * It then adds the tax value to the total cost.
     * The method returns an object containing the calculated values.
     * @param data - An array of Icart objects representing the items in the cart.
     * @param city - The DeliveryCity object representing the current delivery city.
     * @param promoCode - The IpromoCode object representing the promo code applied to the cart.
     * @param taxPercentage - The tax percentage to be applied to the total cost.
     * @returns An object containing the calculated total cost, total shipping, quantity, and tax value.
     */
    calculateTargetPriceAndShipping(data: Icart[], city: DeliveryCity, promoCode: IpromoCode | null, taxPercentage?: number): {
        res: number;
        totalCostNshipping: number;
        qntity: number;
        totalPdct: number;
        totShip: number;
    };
    /**
     * Retrieves the delivery cities from the database or uses the provided deliveryCitys parameter.
     * If an address is provided, it sets the current city based on the address.
     * If isDemo is true, it sets the current city to the first city in the deliveryCitys array.
     * The method returns the delivery cities.
     * @param deliveryCitys - An array of DeliveryCity objects representing the available delivery cities.
     * @param address - The Iaddress object representing the delivery address.
     * @param isDemo - A boolean indicating whether the method is being called for demo purposes.
     * @returns An array of DeliveryCity objects representing the available delivery cities.
     */
    getDeliveryCitys(deliveryCitys: DeliveryCity[], address?: Iaddress, isDemo?: boolean): Promise<DeliveryCity[]>;
    /**
     * Determines the current city based on the address provided.
     * It calls the getDeliveryCitys method to retrieve the delivery
     * cities and sets the current city based on the address.
     * It also calculates the estimated delivery date based on the current city's deliversInDays property.
     * The method returns the estimated delivery date.
     * @param deliveryCitys - An array of DeliveryCity objects representing the available delivery cities.
     * @param addr - The Iaddress object representing the delivery address.
     * @returns The estimated delivery date.
     */
    determineCity(deliveryCitys: DeliveryCity[], addr: Iaddress): Promise<Date>;
}
