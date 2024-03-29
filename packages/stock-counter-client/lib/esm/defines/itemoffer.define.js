import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
/**
 * Represents an item offer.
 */
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
    }
    /**
     * Gets all item offers.
     * @param companyId - The ID of the company
     * @param type The type of the offer.
     * @param url The URL to get the offers from.
     * @param offset The offset to start from.
     * @param limit The maximum number of items to return.
     * @returns An array of ItemOffer instances.
     */
    static async getItemOffers(companyId, type, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemoffer/${url}/${type}/${offset}/${limit}/${companyId}`);
        const offers = await lastValueFrom(observer$);
        return {
            count: offers.count,
            offers: offers.data.map((val) => new ItemOffer(val))
        };
    }
    /**
     * Gets a single item offer.
     * @param companyId - The ID of the company
     * @param id The ID of the offer to get.
     * @returns An instance of ItemOffer.
     */
    static async getOneItemOffer(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemoffer/getone/${id}`);
        const offer = await lastValueFrom(observer$);
        return new ItemOffer(offer);
    }
    /**
     * Creates a new item offer.
     * @param companyId - The ID of the company
     * @param itemoffer The item offer to create.
     * @returns An instance of Isuccess.
     */
    static async createItemOffer(companyId, itemoffer) {
        const observer$ = StockCounterClient.ehttp.makePost(`/itemoffer/create/${companyId}`, {
            itemoffer
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /**
     * Deletes multiple item offers.
     * @param companyId - The ID of the company
     * @param ids The IDs of the offers to delete.
     * @returns An instance of Isuccess.
     */
    static async deleteItemOffers(companyId, ids) {
        const observer$ = StockCounterClient.ehttp.makePut(`/itemoffer/deletemany/${companyId}`, {
            ids
        });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates an item offer.
     * @param companyId - The ID of the company
     * @param vals The values to update the item offer with.
     * @returns An instance of Isuccess.
     */
    async updateItemOffer(companyId, vals) {
        const observer$ = StockCounterClient.ehttp.makePut(`/itemoffer/update/${companyId}`, vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.items = vals.items || this.items;
            this.expireAt = vals.expireAt || this.expireAt;
        }
        return updated;
    }
    /**
     * Deletes an item offer.
     * @param companyId - The ID of the company
     * @returns An instance of Isuccess.
     */
    async deleteItemOffer(companyId) {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemoffer/deleteone/${this._id}/${companyId}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemoffer.define.js.map