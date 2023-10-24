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
    /** constructor : The constructor method
     * initializes the  urId  and  name
     * properties based on the provided data. */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.name = data.name;
    }
    /** getItemLimitteds  static method: This method
     * retrieves item limitteds from the server based
     * on the specified type, URL, offset, and limit.
     * It returns an array of  ItemLimitted  instances. */
    static async getItemLimitteds(offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemlimitted/getall/${offset}/${limit}`);
        const limitteds = await lastValueFrom(observer$);
        return limitteds.map(val => new ItemLimitted(val));
    }
    /** getOneItemLimitted  static method: This method
     * retrieves a specific item limitted from the server
     * based on the provided ID. It returns a single
     * ItemLimitted  instance. */
    static async getOneItemLimitted(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemlimitted/getone/${id}`);
        const limitted = await lastValueFrom(observer$);
        return new ItemLimitted(limitted);
    }
    /** createItemLimitted  static method: This method
     * creates a new item limitted on the server. It accepts
     * a parameter to determine the creation
     * method ('automatic' or 'manual') and the item limitted data.
     * It returns a success response. */
    static async createItemLimitted(data) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemlimitted/create', {
            itemlimitted: data
        });
        return await lastValueFrom(observer$);
    }
    /** deleteItemLimitteds  static method: This method deletes multiple item limitteds from the server based on the provided IDs. It returns a success response. */
    static async deleteItemLimitteds(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemlimitted/deletemany', { ids });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    async update(data) {
        data._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemlimitted/updateone', data);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.name = data.name;
        }
        return updated;
    }
    /** deleteItemLimitted  method: This method deletes the current item limitted instance from the server. It returns a success response. */
    async deleteItemLimitted() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/itemlimitted/deleteone/${this._id}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=itemlimitted.define.js.map