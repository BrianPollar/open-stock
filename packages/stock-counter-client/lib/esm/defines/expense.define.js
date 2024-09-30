import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';
export class Expense extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.name = data.name;
        this.person = data.person;
        this.cost = data.cost;
        this.category = data.category;
        this.note = data.note;
        if (data.items) {
            this.items = data.items.map((val) => new Item(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expense/all/${offset}/${limit}`);
        const expenses = await lastValueFrom(observer$);
        return {
            count: expenses.count,
            expenses: expenses.data.map((val) => new Expense(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expense/filter', filter);
        const expenses = await lastValueFrom(observer$);
        return {
            count: expenses.count,
            expenses: expenses.data.map((val) => new Expense(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expense/one/${urId}`);
        const expense = await lastValueFrom(observer$);
        return new Expense(expense);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expense/add', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expense/delete/many', vals);
        return lastValueFrom(observer$);
    }
    update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expense/update', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp.makeDelete(`/expense/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=expense.define.js.map