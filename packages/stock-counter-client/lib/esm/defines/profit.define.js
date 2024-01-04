/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/**
 * Represents a Profit object.
 * @class
 * @extends DatabaseAuto
 */
export class Profit extends DatabaseAuto {
    /**
     * Creates a new Profit object.
     * @constructor
     * @param {Iprofit} data - The data to create the Profit object.
     */
    constructor(data) {
        super(data);
        this.margin = data.margin;
        this.origCost = data.origCost;
        this.soldAtPrice = data.soldAtPrice;
    }
    /**
     * Gets all Profit objects.
     * @static
     * @async
     * @param {string} url - The URL to get the Profit objects from.
     * @param {number} offset - The offset to start getting Profit objects from.
     * @param {number} limit - The maximum number of Profit objects to get.
     * @returns {Promise<Profit[]>} - A Promise that resolves to an array of Profit objects.
     */
    static async getProfits(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp.makeGet(`profit/${url}/${offset}/${limit}/${companyId}`);
        const profits = await lastValueFrom(observer$);
        return profits.map(val => new Profit(val));
    }
    /**
     * Gets a single Profit object by ID.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the Profit object to get.
     * @returns {Promise<Profit>} - A Promise that resolves to a single Profit object.
     */
    static async getOneProfit(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet('profit/getone/' + id);
        const profit = await lastValueFrom(observer$);
        return new Profit(profit);
    }
    /**
     * Adds a new Profit object.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {Iprofit} vals - The data to create the new Profit object.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    static async addProfit(companyId, vals) {
        const observer$ = StockCounterClient.ehttp.makePost(`/profit/create/${companyId}`, vals);
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple Profit objects.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string[]} ids - The IDs of the Profit objects to delete.
     * @param {any} filesWithDir - The files and directories to delete.
     * @param {string} url - The URL to delete the Profit objects from.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    static async deleteProfits(companyId, ids, filesWithDir, url) {
        const observer$ = StockCounterClient.ehttp.makePut(`${url}/${companyId}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates a single Profit object.
     * @async
     * @param companyId - The ID of the company
     * @param {Iprofit} vals - The data to update the Profit object.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    async updateProfit(companyId, vals) {
        const observer$ = StockCounterClient.ehttp.makePut(`profit/update/${companyId}`, vals);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=profit.define.js.map