/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** */
export class Profit extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.margin = data.margin;
        this.origCost = data.origCost;
        this.soldAtPrice = data.soldAtPrice;
    }
    /** */
    static async getProfits(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`profit/${url}/${offset}/${limit}`);
        const profits = await lastValueFrom(observer$);
        return profits
            .map(val => new Profit(val));
    }
    /** */
    static async getOneProfit(id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet('profit/getone/' + id);
        const profit = await lastValueFrom(observer$);
        return new Profit(profit);
    }
    /** */
    static async addProfit(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/profit/create', vals);
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteProfits(ids, filesWithDir, url) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`${url}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** */
    async updateProfit(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('profit/update', vals);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=profit.define.js.map