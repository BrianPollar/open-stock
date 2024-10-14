"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const estimate_define_1 = require("../estimate.define");
const invoice_define_1 = require("../invoice.define");
class SalesReport extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.estimates) {
            this.estimates = data.estimates.map((val) => new estimate_define_1.Estimate(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map((val) => new invoice_define_1.InvoiceRelatedWithReceipt(val));
        }
        this.currency = data.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/salesreport/all/${offset}/${limit}`);
        const salesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: salesreports.count,
            salesreports: salesreports.data.map((val) => new SalesReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/salesreport/filter', filter);
        const salesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: salesreports.count,
            salesreports: salesreports.data.map((val) => new SalesReport(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/salesreport/one/${urIdOr_id}`);
        const salesreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new SalesReport(salesreport);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/salesreport/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/salesreport/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete('/salesreport/delete/one');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.SalesReport = SalesReport;
//# sourceMappingURL=salesreport.define.js.map