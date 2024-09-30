"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemDecoy = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
const item_define_1 = require("./item.define");
class ItemDecoy extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map(val => new item_define_1.Item(val));
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/itemdecoy/all/${offset}/${limit}`);
        const decoys = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/itemdecoy/filter', filter);
        const decoys = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    static async getOne(_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/itemdecoy/one/${_id}`);
        const decoy = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ItemDecoy(decoy);
    }
    static async add(how, itemdecoy) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/itemdecoy/add/${how}`, { itemdecoy });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/itemdecoy/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeDelete(`/itemdecoy/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ItemDecoy = ItemDecoy;
//# sourceMappingURL=itemdecoy.define.js.map