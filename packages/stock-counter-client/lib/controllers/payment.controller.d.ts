import { Iaddress, Icart, IpromoCode } from '@open-stock/stock-universal';
import { DeliveryCity } from '../defines/delivery.define';
/** The PaymentController class is responsible for handling payment-related operations. It has the following methods: */
export declare class PaymentController {
    /** */
    currentCity: DeliveryCity;
    constructor();
    /** calculateTargetPriceOrShipping(isShipping: boolean, data: Icart[], city: DeliveryCity, promoCode: IpromoCode): This method calculates the total cost or shipping cost based on the parameters provided. It iterates over the items in the cart and calculates the cost based on the item's rate and quantity. If a promo code is provided, it applies the discount to the items specified in the promo code. The method returns the total cost, total shipping, and the final result. */
    calculateTargetPriceOrShipping(isShipping: boolean, data: Icart[], city: DeliveryCity, promoCode: IpromoCode): {
        totalCost: number;
        totalShipping: number;
        res: number;
    };
    /** calculateTargetPriceAndShipping(data: Icart[], city: DeliveryCity, promoCode: IpromoCode, taxPercentage = 0): This method calculates the total cost, total shipping, quantity, and tax value based on the parameters provided. It calls the calculateTargetPriceOrShipping method to calculate the total cost and total shipping separately. It then adds the tax value to the total cost. The method returns an object containing the calculated values.*/
    calculateTargetPriceAndShipping(data: Icart[], city: DeliveryCity, promoCode: IpromoCode, taxPercentage?: number): {
        res: number;
        totalCostNshipping: number;
        qntity: number;
        totalPdct: number;
        totShip: number;
    };
    /** getDeliveryCitys(deliveryCitys: DeliveryCity[], address?: Iaddress, isDemo = false): This method retrieves the delivery cities from the database or uses the provided deliveryCitys parameter. If an address is provided, it sets the current city based on the address. If isDemo is true, it sets the current city to the first city in the deliveryCitys array. The method returns the delivery cities.*/
    getDeliveryCitys(deliveryCitys: DeliveryCity[], address?: Iaddress, isDemo?: boolean): Promise<DeliveryCity[]>;
    /** determineCity(deliveryCitys: DeliveryCity[], addr: Iaddress): This method determines the current city based on the address provided. It calls the getDeliveryCitys method to retrieve the delivery cities and sets the current city based on the address. It also calculates the estimated delivery date based on the current city's deliversInDays property. The method returns the estimated delivery date. */
    determineCity(deliveryCitys: DeliveryCity[], addr: Iaddress): Promise<Date>;
}
