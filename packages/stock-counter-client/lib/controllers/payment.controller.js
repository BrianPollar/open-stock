import { DeliveryCity } from '../defines/delivery.define';
import { StockCounterClient } from '../stock-counter-client';
/** The PaymentController class is responsible for handling payment-related operations. It has the following methods: */
export class PaymentController {
    constructor() { }
    /** calculateTargetPriceOrShipping(isShipping: boolean, data: Icart[], city: DeliveryCity, promoCode: IpromoCode): This method calculates the total cost or shipping cost based on the parameters provided. It iterates over the items in the cart and calculates the cost based on the item's rate and quantity. If a promo code is provided, it applies the discount to the items specified in the promo code. The method returns the total cost, total shipping, and the final result. */
    calculateTargetPriceOrShipping(isShipping, data, city, promoCode) {
        StockCounterClient.logger.debug('PaymentController:calculate:: - i: %i, data: %data, city: %city', isShipping, data, city);
        let res = 0;
        let totalCost;
        let totalShipping;
        if (!isShipping) {
            let alteredData;
            if (promoCode) {
                /** const filteredItems = data
                  .filter(val => promoCode.items.includes(val.item._id || val.item));**/
                const cartWithoutPromo = data
                    .filter(val => !promoCode.items.includes(val.item._id || val.item));
                alteredData = cartWithoutPromo;
                res += promoCode.amount;
            }
            else {
                alteredData = data;
            }
            for (const j of alteredData) {
                if (j.item.costMeta.offer) {
                    j.totalCostwithNoShipping = StockCounterClient.calcCtrl.calculateFromDiscount(parseInt(j.rate.toString(), 10), j.item.costMeta.discount) * j.quantity;
                    res += j.totalCostwithNoShipping;
                }
                else {
                    j.totalCostwithNoShipping = j.rate * j.item.quantity;
                    res += j.totalCostwithNoShipping;
                }
            }
            totalCost = res;
        }
        if (isShipping) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            /** for (const j of data) {
              if (city && city?.shippingCost) {
                res += city.shippingCost;
              } else {
                res += 0;
              }
            }*/
            if (city && city.shippingCost) {
                res = city.shippingCost; // FOR NOW ALL ITEMS ON ONE SHIPPING COST
            }
            else {
                res = 0;
            }
            totalShipping = res;
        }
        StockCounterClient.logger.debug('PaymentController:calculate:: - res', res);
        return {
            totalCost,
            totalShipping,
            res
        };
    }
    /** calculateTargetPriceAndShipping(data: Icart[], city: DeliveryCity, promoCode: IpromoCode, taxPercentage = 0): This method calculates the total cost, total shipping, quantity, and tax value based on the parameters provided. It calls the calculateTargetPriceOrShipping method to calculate the total cost and total shipping separately. It then adds the tax value to the total cost. The method returns an object containing the calculated values.*/
    calculateTargetPriceAndShipping(data, city, promoCode, taxPercentage = 0) {
        StockCounterClient.logger.debug('PaymentController:add:: - data: %data, city: %city', data, city);
        const totalPdct = this.calculateTargetPriceOrShipping(false, data, city, promoCode);
        const totShip = this.calculateTargetPriceOrShipping(true, data, city, promoCode);
        const res = totalPdct.res + totShip.res;
        let totalCostNshipping = res;
        const qntity = data.reduce((accumulator, val) => accumulator + val.item.orderedQty, 0);
        let taxVal = 0;
        if (taxPercentage && taxPercentage > 0) {
            taxVal = (taxPercentage / 100) * res;
        }
        totalCostNshipping = res + taxVal;
        return {
            res: res + taxVal,
            totalCostNshipping,
            qntity,
            totalPdct: totalPdct.res,
            totShip: totShip.res
        };
    }
    /** getDeliveryCitys(deliveryCitys: DeliveryCity[], address?: Iaddress, isDemo = false): This method retrieves the delivery cities from the database or uses the provided deliveryCitys parameter. If an address is provided, it sets the current city based on the address. If isDemo is true, it sets the current city to the first city in the deliveryCitys array. The method returns the delivery cities.*/
    async getDeliveryCitys(deliveryCitys, address, isDemo = false) {
        if (!deliveryCitys?.length) {
            deliveryCitys = await DeliveryCity
                .getDeliveryCitys();
            if (!address) {
                this.currentCity = deliveryCitys[0]; // TODO
            }
        }
        else if (address) {
            this.currentCity = deliveryCitys
                .find(val => val._id === address.city);
        }
        if (isDemo) {
            this.currentCity = deliveryCitys[0];
        }
        return deliveryCitys;
    }
    /** determineCity(deliveryCitys: DeliveryCity[], addr: Iaddress): This method determines the current city based on the address provided. It calls the getDeliveryCitys method to retrieve the delivery cities and sets the current city based on the address. It also calculates the estimated delivery date based on the current city's deliversInDays property. The method returns the estimated delivery date. */
    async determineCity(deliveryCitys, addr) {
        StockCounterClient.logger.debug('PaymentController:determineCity:: - addr', addr);
        await this.getDeliveryCitys(deliveryCitys, addr);
        this.currentCity = deliveryCitys.find(val => val._id === addr.city);
        const date = new Date();
        const deliversInDays = this.currentCity.deliversInDays;
        if (deliversInDays < 30) {
            date.setDate(date.getDate() + deliversInDays);
        }
        else if (deliversInDays > 30 && deliversInDays < 360) {
            date.setMonth(date.getMonth() + Math.round(deliversInDays / 30));
        }
        else {
            date.setFullYear(date.getFullYear() + Math.round(deliversInDays / 360));
        }
        return date;
    }
}
//# sourceMappingURL=payment.controller.js.map