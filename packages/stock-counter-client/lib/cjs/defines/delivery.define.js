"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryCity = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class DeliveryCity extends stock_universal_1.DatabaseAuto {
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverycity/all/${offset}/${limit}`);
        const citys = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverycity/one/${_id}`);
        const city = await (0, rxjs_1.lastValueFrom)(observer$);
        return new DeliveryCity(city);
    }
    /**
     * Creates a new delivery city on the server.
  
     * @param deliverycity An object containing the data for the new delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    static add(deliverycity) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/deliverycity/add', {
            deliverycity
        });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple delivery cities from the server.
  
     * @param _ids An array of IDs of the delivery cities to delete.
     * @returns An object indicating whether the operation was successful.
     */
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/deliverycity/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the properties of the current
     *  instance with the provided values and sends a
     *  request to the server to update the corresponding delivery city.
  
     * @param vals An object containing the new values for the delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    async update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/deliverycity/update', vals);
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/deliverycity/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.DeliveryCity = DeliveryCity;
//# sourceMappingURL=delivery.define.js.map