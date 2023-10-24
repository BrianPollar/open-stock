/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { Item } from './item.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';
/** */
export class ItemOffer extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.items = data.items
            .map(val => new Item(val));
        this.expireAt = data.expireAt;
        this.type = data.type;
        this.header = data.header;
        this.subHeader = data.subHeader;
        this.ammount = data.ammount;
    }
    /** */
    static async getItemOffers(type, url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemoffer/${url}/${type}/${offset}/${limit}`);
        const offers = await lastValueFrom(observer$);
        return offers.map(val => new ItemOffer(val));
    }
    /** */
    static async getOneItemOffer(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/itemoffer/getone/${id}`);
        const offer = await lastValueFrom(observer$);
        return new ItemOffer(offer);
    }
    /** */
    static async createItemOffer(itemoffer) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemoffer/create', {
            itemoffer
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /** */
    static async deleteItemOffers(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemoffer/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
    /** */
    async updateItemOffer(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemoffer/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.items = vals.items || this.items;
            this.expireAt = vals.expireAt || this.expireAt;
        }
        return updated;
    }
    /** */
    async deleteItemOffer() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/itemoffer/deleteone/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemoffer.define.js.map