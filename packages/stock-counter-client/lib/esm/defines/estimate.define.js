import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export class Estimate extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.estimateId = data.estimateId;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
        this.urId = data.urId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/all/${offset}/${limit}`);
        const estimates = await lastValueFrom(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/estimate/filter', filter);
        const estimates = await lastValueFrom(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/one/${urId}`);
        const estimate = await lastValueFrom(observer$);
        return new Estimate(estimate);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/estimate/add', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/delete/many', val);
        return lastValueFrom(observer$);
    }
    updatePdt(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/updatepdt', { items: vals, _id: this._id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=estimate.define.js.map