"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estimate = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const invoice_define_1 = require("./invoice.define");
class Estimate extends invoice_define_1.InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.estimateId = data.estimateId;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
        this.urId = data.urId;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/estimate/all/${offset}/${limit}`);
        const estimates = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/estimate/filter', filter);
        const estimates = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/estimate/one/${urIdOr_id}`);
        const estimate = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Estimate(estimate);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/estimate/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/estimate/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    updatePdt(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/estimate/updatepdt', { items: vals, _id: this._id });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/estimate/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Estimate = Estimate;
//# sourceMappingURL=estimate.define.js.map