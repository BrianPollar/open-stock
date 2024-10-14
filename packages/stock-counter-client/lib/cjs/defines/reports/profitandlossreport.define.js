"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitAndLossReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const expense_define_1 = require("../expense.define");
const invoice_define_1 = require("../invoice.define");
class ProfitAndLossReport extends stock_universal_1.DatabaseAuto {
    /**
     * Creates a new instance of ProfitAndLossReport.
     * @param data - The data to initialize the report with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.expenses) {
            this.expenses = data.expenses.map(val => new expense_define_1.Expense(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map(val => new invoice_define_1.InvoiceRelatedWithReceipt(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/profitandlossreport/all/${offset}/${limit}`);
        const profitandlossreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: profitandlossreports.count,
            profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/profitandlossreport/filter', filter);
        const profitandlossreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: profitandlossreports.count,
            profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/profitandlossreport/one/${urIdOr_id}`);
        const profitandlossreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new ProfitAndLossReport(profitandlossreport);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/profitandlossreport/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/profitandlossreport/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete('/profitandlossreport/delete/one');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.ProfitAndLossReport = ProfitAndLossReport;
//# sourceMappingURL=profitandlossreport.define.js.map