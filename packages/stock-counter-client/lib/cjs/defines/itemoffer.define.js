"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOffer = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const item_define_1 = require("./item.define");
class ItemOffer extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map((val) => new item_define_1.Item(val));
        this.expireAt = data.expireAt;
        this.type = data.type;
        this.header = data.header;
        this.subHeader = data.subHeader;
        this.ammount = data.ammount;
        this.currency = data.currency;
    }
    static async getAll(type, // TODO union here
    offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/itemoffer/all/${type}/${offset}/${limit}`);
        const offers = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: offers.count,
            offers: offers.data.map((val) => new ItemOffer(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/itemoffer/filter', filter);
        const offers = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: offers.count,
            offers: offers.data.map((val) => new ItemOffer(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/itemoffer/one/${urIdOr_id}`);
        const offer = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ItemOffer(offer);
    }
    static add(itemoffer) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/itemoffer/add', {
            itemoffer
        });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/itemoffer/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/itemoffer/update', vals);
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        if (updated.success) {
            this.items = vals.items || this.items;
            this.expireAt = vals.expireAt || this.expireAt;
        }
        return updated;
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/itemoffer/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ItemOffer = ItemOffer;
//# sourceMappingURL=itemoffer.define.js.map