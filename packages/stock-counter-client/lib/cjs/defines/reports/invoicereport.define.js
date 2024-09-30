"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const invoice_define_1 = require("../invoice.define");
class InvoiceReport extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.invoices) {
            this.invoices = data.invoices.map(val => new invoice_define_1.Invoice(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicesreport/all/${offset}/${limit}`);
        const invoicesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoicesreport/filter', filter);
        const invoicesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/invoicesreport/one/${urId}`);
        const invoicesreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceReport(invoicesreport);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoicesreport/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoicesreport/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/invoicesreport/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.InvoiceReport = InvoiceReport;
//# sourceMappingURL=invoicereport.define.js.map