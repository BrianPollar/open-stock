import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
export class ItemOffer extends DatabaseAuto {
    /**
     * Creates a new instance of ItemOffer.
     * @param data The data to initialize the instance with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map((val) => new Item(val));
        this.expireAt = data.expireAt;
        this.type = data.type;
        this.header = data.header;
        this.subHeader = data.subHeader;
        this.ammount = data.ammount;
        this.currency = data.currency;
    }
    /**
     * Gets all item offers.
  
     * @param type The type of the offer.
     * @param url The URL to get the offers from.
     * @param offset The offset to start from.
     * @param limit The maximum number of items to return.
     * @returns An array of ItemOffer instances.
     */
    static async getAll(type, // TODO union here
    offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemoffer/all/${type}/${offset}/${limit}`);
        const offers = await lastValueFrom(observer$);
        return {
            count: offers.count,
            offers: offers.data.map((val) => new ItemOffer(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemoffer/filter', filter);
        const offers = await lastValueFrom(observer$);
        return {
            count: offers.count,
            offers: offers.data.map((val) => new ItemOffer(val))
        };
    }
    /**
     * Gets a single item offer.
  
     * @param _id The ID of the offer to get.
     * @returns An instance of ItemOffer.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemoffer/one/${_id}`);
        const offer = await lastValueFrom(observer$);
        return new ItemOffer(offer);
    }
    /**
     * Creates a new item offer.
  
     * @param itemoffer The item offer to create.
     * @returns An instance of Isuccess.
     */
    static add(itemoffer) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemoffer/add', {
            itemoffer
        });
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple item offers.
  
     * @param _ids The IDs of the offers to delete.
     * @returns An instance of Isuccess.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemoffer/delete/many', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Updates an item offer.
  
     * @param vals The values to update the item offer with.
     * @returns An instance of Isuccess.
     */
    async update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemoffer/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.items = vals.items || this.items;
            this.expireAt = vals.expireAt || this.expireAt;
        }
        return updated;
    }
    /**
     * Deletes an item offer.
  
     * @returns An instance of Isuccess.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemoffer/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemoffer.define.js.map