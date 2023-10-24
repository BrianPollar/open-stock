/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { Item } from './item.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';
/** ItemDecoy  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item decoy object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  items  (an array of  Item  objects). */
export class ItemDecoy extends DatabaseAuto {
    /** constructor : The constructor method
     * initializes the  urId  and  items
     * properties based on the provided data. */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.items = data.items.map(val => new Item(val));
    }
    /** getItemDecoys  static method: This method
     * retrieves item decoys from the server based
     * on the specified type, URL, offset, and limit.
     * It returns an array of  ItemDecoy  instances. */
    static async getItemDecoys(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemdecoy/${url}/${offset}/${limit}`);
        const decoys = await lastValueFrom(observer$);
        return decoys.map(val => new ItemDecoy(val));
    }
    /** getOneItemDecoy  static method: This method
     * retrieves a specific item decoy from the server
     * based on the provided ID. It returns a single
     * ItemDecoy  instance. */
    static async getOneItemDecoy(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemdecoy/getone/${id}`);
        const decoy = await lastValueFrom(observer$);
        return new ItemDecoy(decoy);
    }
    /** createItemDecoy  static method: This method
     * creates a new item decoy on the server. It accepts
     * a parameter to determine the creation
     * method ('automatic' or 'manual') and the item decoy data.
     * It returns a success response. */
    static async createItemDecoy(how, itemdecoy) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/itemdecoy/create/${how}`, {
            itemdecoy
        });
        return await lastValueFrom(observer$);
    }
    /** deleteItemDecoys  static method: This method deletes multiple item decoys from the server based on the provided IDs. It returns a success response. */
    static async deleteItemDecoys(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemdecoy/deletemany', { ids });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /** deleteItemDecoy  method: This method deletes the current item decoy instance from the server. It returns a success response. */
    async deleteItemDecoy() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/itemdecoy/deleteone/${this._id}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=itemdecoy.define.js.map