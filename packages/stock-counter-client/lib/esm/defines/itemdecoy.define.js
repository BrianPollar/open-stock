import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
export class ItemDecoy extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.items = data.items.map(val => new Item(val));
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemdecoy/all/${offset}/${limit}`);
        const decoys = await lastValueFrom(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/itemdecoy/filter', filter);
        const decoys = await lastValueFrom(observer$);
        return {
            count: decoys.count,
            decoys: decoys.data.map(val => new ItemDecoy(val))
        };
    }
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/itemdecoy/one/${_id}`);
        const decoy = await lastValueFrom(observer$);
        return new ItemDecoy(decoy);
    }
    static async add(how, itemdecoy) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/itemdecoy/add/${how}`, { itemdecoy });
        return await lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/itemdecoy/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/itemdecoy/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=itemdecoy.define.js.map