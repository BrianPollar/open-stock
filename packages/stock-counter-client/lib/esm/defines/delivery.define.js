import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
export class DeliveryCity extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.shippingCost = data.shippingCost;
        this.currency = data.currency;
        this.deliversInDays = data.deliversInDays;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverycity/all/${offset}/${limit}`);
        const citys = await lastValueFrom(observer$);
        return {
            count: citys.count,
            citys: citys.data.map(val => new DeliveryCity(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverycity/one/${urIdOr_id}`);
        const city = await lastValueFrom(observer$);
        return new DeliveryCity(city);
    }
    static add(deliverycity) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverycity/add', {
            deliverycity
        });
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverycity/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverycity/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.name = vals.name || this.name;
            this.shippingCost = vals.shippingCost || this.shippingCost;
            this.currency = vals.currency || this.currency;
            this.deliversInDays = vals.deliversInDays || this.deliversInDays;
        }
        return updated;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/deliverycity/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=delivery.define.js.map