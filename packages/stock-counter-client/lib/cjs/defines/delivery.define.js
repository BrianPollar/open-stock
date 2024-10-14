"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryCity = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class DeliveryCity extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.shippingCost = data.shippingCost;
        this.currency = data.currency;
        this.deliversInDays = data.deliversInDays;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverycity/all/${offset}/${limit}`);
        const citys = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: citys.count,
            citys: citys.data.map(val => new DeliveryCity(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/deliverycity/one/${urIdOr_id}`);
        const city = await (0, rxjs_1.lastValueFrom)(observer$);
        return new DeliveryCity(city);
    }
    static add(deliverycity) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/deliverycity/add', {
            deliverycity
        });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/deliverycity/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/deliverycity/update', vals);
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        if (updated.success) {
            this.name = vals.name || this.name;
            this.shippingCost = vals.shippingCost || this.shippingCost;
            this.currency = vals.currency || this.currency;
            this.deliversInDays = vals.deliversInDays || this.deliversInDays;
        }
        return updated;
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/deliverycity/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.DeliveryCity = DeliveryCity;
//# sourceMappingURL=delivery.define.js.map