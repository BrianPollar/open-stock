"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const expense_define_1 = require("../expense.define");
class ExpenseReport extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses.map((val) => new expense_define_1.Expense(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 10) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/expensereport/all/${offset}/${limit}`);
        const expensereports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: expensereports.count,
            expensereports: expensereports.data.map((val) => new ExpenseReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/expensereport/filter', filter);
        const expensereports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: expensereports.count,
            expensereports: expensereports.data.map((val) => new ExpenseReport(val))
        };
    }
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/expensereport/one/${urId}`);
        const expensereport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ExpenseReport(expensereport);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/expensereport/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/expensereport/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/expensereport/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ExpenseReport = ExpenseReport;
//# sourceMappingURL=expensereport.define.js.map