import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
export class ExpenseReport extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses.map((val) => new Expense(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 10) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expensereport/all/${offset}/${limit}`);
        const expensereports = await lastValueFrom(observer$);
        return {
            count: expensereports.count,
            expensereports: expensereports.data.map((val) => new ExpenseReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expensereport/filter', filter);
        const expensereports = await lastValueFrom(observer$);
        return {
            count: expensereports.count,
            expensereports: expensereports.data.map((val) => new ExpenseReport(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/expensereport/one/${urId}`);
        const expensereport = await lastValueFrom(observer$);
        return new ExpenseReport(expensereport);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/expensereport/add', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/expensereport/delete/many', val);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/expensereport/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=expensereport.define.js.map