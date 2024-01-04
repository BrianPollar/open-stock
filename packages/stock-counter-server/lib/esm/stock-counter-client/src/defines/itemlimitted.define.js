/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';
/** ItemLimitted  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item limitted object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  name  (an array of  Item  objects). */
export class ItemLimitted extends DatabaseAuto {
    /**
     * Creates an instance of ItemLimitted.
     * @param data - The data to initialize the instance with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.name = data.name;
    }
    /**
     * Retrieves item limitteds from the server based
     * on the specified type, URL, offset, and limit.
     * @param companyId - The ID of the company
     * @param offset - The offset to start retrieving item limitteds from.
     * @param limit - The maximum number of item limitteds to retrieve.
     * @returns An array of ItemLimitted instances.
     */
    static async getItemLimitteds(companyId, offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemlimitted/getall/${offset}/${limit}/${companyId}`);
        const limitteds = await lastValueFrom(observer$);
        return limitteds.map(val => new ItemLimitted(val));
    }
    /**
     * Retrieves a specific item limitted from the server
     * based on the provided ID.
     * @param companyId - The ID of the company
     * @param id - The ID of the item limitted to retrieve.
     * @returns A single ItemLimitted instance.
     */
    static async getOneItemLimitted(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemlimitted/getone/${id}`);
        const limitted = await lastValueFrom(observer$);
        return new ItemLimitted(limitted);
    }
    /**
     * Creates a new item limitted on the server.
     * @param companyId - The ID of the company
     * @param data - The data to create the item limitted with.
     * @returns A success response.
     */
    static async createItemLimitted(companyId, data) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/itemlimitted/create/${companyId}`, {
            itemlimitted: data
        });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple item limitteds from the server based on the provided IDs.
     * @param companyId - The ID of the company
     * @param ids - The IDs of the item limitteds to delete.
     * @returns A success response.
     */
    static async deleteItemLimitteds(companyId, ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/itemlimitted/deletemany/${companyId}`, { ids });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /**
     * Updates the current item limitted instance on the server.
     * @param companyId - The ID of the company
     * @param data - The data to update the item limitted with.
     * @returns A success response.
     */
    async update(companyId, data) {
        data._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut(`/itemlimitted/updateone/${companyId}`, data);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.name = data.name;
        }
        return updated;
    }
    /**
     * Deletes the current item limitted instance from the server.
     * @param companyId - The ID of the company
     * @returns A success response.
     */
    async deleteItemLimitted(companyId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/itemlimitted/deleteone/${this._id}/${companyId}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=itemlimitted.define.js.map