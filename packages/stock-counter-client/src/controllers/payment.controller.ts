import { Iaddress, Icart, IpromoCode } from '@open-stock/stock-universal';
import { DeliveryCity } from '../defines/delivery.define';
import { Item } from '../defines/item.define';
import { StockCounterClient } from '../stock-counter-client';

/**
 * The PaymentController class is responsible for handling payment-related operations.
 * It has the following methods:
 */
export class PaymentController {
  /** The current delivery city */
  currentCity: DeliveryCity;

  constructor() { }

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
  calculateTargetPriceOrShipping(isShipping: boolean, data: Icart[], city: DeliveryCity, promoCode: IpromoCode | null) {
    StockCounterClient.logger.debug('PaymentController:calculate:: isShipping', isShipping, data, city);
    let res = 0;
    let totalCost: number;
    let totalShipping: number;

    if (!isShipping) {
      let alteredData: Icart[];

      if (promoCode) {
        /** const filteredItems = data
          .filter(val => promoCode.items.includes(val.item._id || val.item));**/
        const cartWithoutPromo = data
          .filter(val => !promoCode.items.includes(val.item._id || val.item));

        alteredData = cartWithoutPromo;
        res += promoCode.amount; // ????
      } else {
        alteredData = data;
      }

      for (const j of alteredData) {
        if (j.item.costMeta.offer) {
          j.totalCostwithNoShipping = StockCounterClient.calcCtrl.calculateFromDiscount(j.item.costMeta.sellingPrice, j.item.costMeta.discount) * j.quantity;
          res += j.totalCostwithNoShipping;
        } else {
          j.totalCostwithNoShipping = j.item.costMeta.sellingPrice * j.quantity;
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
      } */
      if (city && city.shippingCost) {
        res = city.shippingCost; // FOR NOW ALL ITEMS ON ONE SHIPPING COST
      } else {
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
  calculateTargetPriceAndShipping(data: Icart[], city: DeliveryCity, promoCode: IpromoCode | null, taxPercentage = 0) {
    StockCounterClient.logger.debug('PaymentController:add:: - data: ', data);
    const totalPdct = this.calculateTargetPriceOrShipping(false, data, city, promoCode);
    const totShip = this.calculateTargetPriceOrShipping(true, data, city, promoCode);
    const res = totalPdct.res + totShip.res;
    let totalCostNshipping = res;
    const qntity = data.reduce((accumulator, val)=> accumulator + (val.item as Item).orderedQty, 0);
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
  async getDeliveryCitys(companyId: string, deliveryCitys: DeliveryCity[], address?: Iaddress, isDemo = false) {
    if (!deliveryCitys?.length) {
      const { citys } = await DeliveryCity
        .getDeliveryCitys(companyId);

      deliveryCitys = citys;
      if (!address) {
        this.currentCity = deliveryCitys[0];
      }
    } else if (address) {
      this.currentCity = deliveryCitys
        .find(val => val._id === address.city);
    }
    if (isDemo) {
      this.currentCity = deliveryCitys[0];
    }

    return deliveryCitys;
  }

  /**
   * Determines the current city based on the address provided.
   * It calls the getDeliveryCitys method to retrieve the delivery cities and sets the current city based on the address.
   * It also calculates the estimated delivery date based on the current city's deliversInDays property.
   * The method returns the estimated delivery date.
   * @param deliveryCitys - An array of DeliveryCity objects representing the available delivery cities.
   * @param addr - The Iaddress object representing the delivery address.
   * @returns The estimated delivery date.
   */
  async determineCity(companyId: string, deliveryCitys: DeliveryCity[], addr: Iaddress) {
    StockCounterClient.logger.debug('PaymentController:determineCity:: - addr', addr);
    await this.getDeliveryCitys(companyId, deliveryCitys, addr);
    this.currentCity = deliveryCitys.find(val => val._id === addr.city);
    const date = new Date();
    const deliversInDays = this.currentCity.deliversInDays;

    if (deliversInDays < 30) {
      date.setDate(date.getDate() + deliversInDays);
    } else if (deliversInDays > 30 && deliversInDays < 360) {
      date.setMonth(date.getMonth() + Math.round(deliversInDays / 30));
    } else {
      date.setFullYear(date.getFullYear() + Math.round(deliversInDays / 360));
    }

    return date;
  }
}

