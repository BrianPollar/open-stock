import { lastValueFrom } from 'rxjs';
import { Item } from './item.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';
/**
 * ItemDecoy class: This class extends the DatabaseAuto class and represents
 * an item decoy object in the database. It has properties for urId (a string representing the UUID)
 * and items (an array of Item objects).
 */
export class ItemDecoy extends DatabaseAuto {
    /**
     * Constructor method initializes the urId and items properties based on the provided data.
     * @param data An object containing the data to initialize the properties.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map(val => new Item(val));
    }
    /**
     * Static method that retrieves item decoys from the server based on the specified type, URL, offset, and limit.
     * It returns an array of ItemDecoy instances.
     * @param companyId - The ID of the company
     * @param url A string representing the URL to retrieve the item decoys from.
     * @param offset A number representing the offset to start retrieving the item decoys from.
     * @param limit A number representing the maximum number of item decoys to retrieve.
     * @returns An array of ItemDecoy instances.
     */
    static async getItemDecoys(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemdecoy/${url}/${offset}/${limit}/${companyId}`);
        const decoys = await lastValueFrom(observer$);
        return decoys.map(val => new ItemDecoy(val));
    }
    /**
     * Static method that retrieves a specific item decoy from the server based on the provided ID.
     * It returns a single ItemDecoy instance.
     * @param companyId - The ID of the company
     * @param id A string representing the ID of the item decoy to retrieve.
     * @returns A single ItemDecoy instance.
     */
    static async getOneItemDecoy(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemdecoy/getone/${id}`);
        const decoy = await lastValueFrom(observer$);
        return new ItemDecoy(decoy);
    }
    /**
     * Static method that creates a new item decoy on the server.
     * It accepts a parameter to determine the creation method ('automatic' or 'manual') and the item decoy data.
     * It returns a success response.
     * @param how A string representing the creation method ('automatic' or 'manual').
     * @param itemdecoy An object containing the item decoy data.
     * @returns A success response.
     */
    static async createItemDecoy(companyId, how, itemdecoy) {
        const observer$ = StockCounterClient.ehttp.makePost(`/itemdecoy/create/${how}`, { itemdecoy });
        return await lastValueFrom(observer$);
    }
    /**
     * Static method that deletes multiple item decoys from the server based on the provided IDs.
     * It returns a success response.
     * @param companyId - The ID of the company
     * @param ids An array of strings representing the IDs of the item decoys to delete.
     * @returns A success response.
     */
    static async deleteItemDecoys(companyId, ids) {
        const observer$ = StockCounterClient.ehttp.makePut(`/itemdecoy/deletemany/${companyId}`, { ids });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /**
     * Method that deletes the current item decoy instance from the server.
     * It returns a success response.
     * @returns A success response.
     */
    async deleteItemDecoy(companyId) {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemdecoy/deleteone/${this._id}/${companyId}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=itemdecoy.define.js.map