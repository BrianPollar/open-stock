import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
export class DeliveryCity extends DatabaseAuto {
    /**
     * Creates a new instance of DeliveryCity.
     * @param data An object containing the data to initialize the instance.
     */
    constructor(data) {
        super(data);
        this.name = data.name;
        this.shippingCost = data.shippingCost;
        this.currency = data.currency;
        this.deliversInDays = data.deliversInDays;
    }
    /**
     * Retrieves all delivery cities from the server.
  
     * @param url The URL to retrieve the delivery cities from.
     * @param offset The offset to start retrieving the delivery cities from.
     * @param limit The maximum number of delivery cities to retrieve.
     * @returns An array of DeliveryCity instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverycity/all/${offset}/${limit}`);
        const citys = await lastValueFrom(observer$);
        return {
            count: citys.count,
            citys: citys.data.map(val => new DeliveryCity(val))
        };
    }
    /**
     * Retrieves a single delivery city from the server.
  
     * @param _id The ID of the delivery city to retrieve.
     * @returns A DeliveryCity instance.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverycity/one/${_id}`);
        const city = await lastValueFrom(observer$);
        return new DeliveryCity(city);
    }
    /**
     * Creates a new delivery city on the server.
  
     * @param deliverycity An object containing the data for the new delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    static add(deliverycity) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverycity/add', {
            deliverycity
        });
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple delivery cities from the server.
  
     * @param _ids An array of IDs of the delivery cities to delete.
     * @returns An object indicating whether the operation was successful.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverycity/delete/many', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Updates the properties of the current
     *  instance with the provided values and sends a
     *  request to the server to update the corresponding delivery city.
  
     * @param vals An object containing the new values for the delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    async update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverycity/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.name = vals.name || this.name;
            this.shippingCost = vals.shippingCost || this.shippingCost;
            this.currency = vals.currency || this.currency;
            this.deliversInDays = vals.deliversInDays || this.deliversInDays;
        }
        return updated;
    }
    /**
     * Sends a request to the server to delete the current delivery city.
  
     * @returns An object indicating whether the operation was successful.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/deliverycity/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=delivery.define.js.map