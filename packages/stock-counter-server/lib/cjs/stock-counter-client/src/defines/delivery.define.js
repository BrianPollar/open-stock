"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryCity = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
/** The  DeliveryCity  class extends the  DatabaseAuto  class and has properties for name, shipping cost, currency, and delivery time. The constructor initializes these properties using the data provided. The class also provides static methods for retrieving delivery cities from the server, creating a new delivery city, deleting multiple delivery cities, updating a delivery city, and deleting a single delivery city. */
/**
 * Represents a delivery city with its properties.
 */
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
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the delivery cities from.
     * @param offset The offset to start retrieving the delivery cities from.
     * @param limit The maximum number of delivery cities to retrieve.
     * @returns An array of DeliveryCity instances.
     */
    static async getDeliveryCitys(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverycity/${url}/${offset}/${limit}/${companyId}`);
        const citys = await (0, rxjs_1.lastValueFrom)(observer$);
        return citys.map(val => new DeliveryCity(val));
    }
    /**
     * Retrieves a single delivery city from the server.
     * @param companyId - The ID of the company
     * @param id The ID of the delivery city to retrieve.
     * @returns A DeliveryCity instance.
     */
    static async getOneDeliveryCity(companyId, id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/deliverycity/getone/${id}`);
        const city = await (0, rxjs_1.lastValueFrom)(observer$);
        return new DeliveryCity(city);
    }
    /**
     * Creates a new delivery city on the server.
     * @param companyId - The ID of the company
     * @param deliverycity An object containing the data for the new delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    static async createDeliveryCity(companyId, deliverycity) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/deliverycity/create/${companyId}`, {
            deliverycity
        });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple delivery cities from the server.
     * @param companyId - The ID of the company
     * @param ids An array of IDs of the delivery cities to delete.
     * @returns An object indicating whether the operation was successful.
     */
    static async deleteDeliveryCitys(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/deliverycity/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the properties of the current instance with the provided values and sends a request to the server to update the corresponding delivery city.
     * @param companyId - The ID of the company
     * @param vals An object containing the new values for the delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    async updateDeliveryCity(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/deliverycity/update/${companyId}`, vals);
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
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful.
     */
    async deleteDeliveryCity(companyId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/deliverycity/deleteone/${this._id}/${companyId}`);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.DeliveryCity = DeliveryCity;
//# sourceMappingURL=delivery.define.js.map