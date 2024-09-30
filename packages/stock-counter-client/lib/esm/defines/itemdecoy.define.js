import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
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
  
     * @param url A string representing the URL to retrieve the item decoys from.
     * @param offset A number representing the offset to start retrieving the item decoys from.
     * @param limit A number representing the maximum number of item decoys to retrieve.
     * @returns An array of ItemDecoy instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemdecoy/all/${offset}/${limit}`);
        const decoys = await lastValueFrom(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemdecoy/filter', filter);
        const decoys = await lastValueFrom(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    /**
     * Static method that retrieves a specific item decoy from the server based on the provided ID.
     * It returns a single ItemDecoy instance.
  
     * @param _id A string representing the ID of the item decoy to retrieve.
     * @returns A single ItemDecoy instance.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemdecoy/one/${_id}`);
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
    static async add(how, itemdecoy) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/itemdecoy/add/${how}`, { itemdecoy });
        return await lastValueFrom(observer$);
    }
    /**
     * Static method that deletes multiple item decoys from the server based on the provided IDs.
     * It returns a success response.
  
     * @param _ids An array of strings representing the IDs of the item decoys to delete.
     * @returns A success response.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemdecoy/delete/many', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Method that deletes the current item decoy instance from the server.
     * It returns a success response.
     * @returns A success response.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemdecoy/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemdecoy.define.js.map