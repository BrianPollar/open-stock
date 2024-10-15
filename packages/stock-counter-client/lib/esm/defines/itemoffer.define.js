import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
export class ItemOffer extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map((val) => new Item(val));
        this.expireAt = data.expireAt;
        this.type = data.type;
        this.header = data.header;
        this.subHeader = data.subHeader;
        this.amount = data.amount;
        this.currency = data.currency;
    }
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
    static async getOne(urIdOr_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemoffer/one/${urIdOr_id}`);
        const offer = await lastValueFrom(observer$);
        return new ItemOffer(offer);
    }
    static add(itemoffer) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemoffer/add', {
            itemoffer
        });
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemoffer/delete/many', vals);
        return lastValueFrom(observer$);
    }
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
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemoffer/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemoffer.define.js.map