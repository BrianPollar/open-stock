/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** The  DeliveryCity  class extends the  DatabaseAuto  class and has properties for name, shipping cost, currency, and delivery time. The constructor initializes these properties using the data provided. The class also provides static methods for retrieving delivery cities from the server, creating a new delivery city, deleting multiple delivery cities, updating a delivery city, and deleting a single delivery city. */
export class DeliveryCity extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.name = data.name;
        this.shippingCost = data.shippingCost;
        this.currency = data.currency;
        this.deliversInDays = data.deliversInDays;
    }
    /** */
    static async getDeliveryCitys(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverycity/${url}/${offset}/${limit}`);
        const citys = await lastValueFrom(observer$);
        return citys.map(val => new DeliveryCity(val));
    }
    /** */
    static async getOneDeliveryCity(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/deliverycity/getone/${id}`);
        const city = await lastValueFrom(observer$);
        return new DeliveryCity(city);
    }
    /** */
    static async createDeliveryCity(deliverycity) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverycity/create', {
            deliverycity
        });
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteDeliveryCitys(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverycity/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
    /** The  updateDeliveryCity  method updates the properties of the current instance with the provided values and sends a request to the server to update the corresponding delivery city. */
    async updateDeliveryCity(vals) {
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
    /** The  deleteDeliveryCity  method sends a request to the server to delete the current delivery city. */
    async deleteDeliveryCity() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/deliverycity/deleteone/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=delivery.define.js.map