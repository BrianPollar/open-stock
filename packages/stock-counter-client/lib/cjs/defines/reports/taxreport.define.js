"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const estimate_define_1 = require("../estimate.define");
const invoice_define_1 = require("../invoice.define");
class TaxReport extends stock_universal_1.DatabaseAuto {
    /**
     * TaxReport constructor: The constructor accepts an object (data) that implements the ItaxReport interface.
     * It initializes the properties of the TaxReport instance based on the provided data.
     * @param data An object that implements the ItaxReport interface.
     */
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
    /**
     * Retrieves multiple tax reports from the server.
  
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of TaxReport instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/taxreport/all/${offset}/${limit}`);
        const taxreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: taxreports.count,
            taxreports: taxreports.data.map((val) => new TaxReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/taxreport/filter', filter);
        const taxreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: taxreports.count,
            taxreports: taxreports.data.map((val) => new TaxReport(val))
        };
    }
    /**
     * Retrieves a single tax report from the server based on the provided unique identifier (urId).
  
     * @param urId A string representing the unique identifier of the tax report.
     * @returns A TaxReport instance.
     */
    static async getOne(urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/taxreport/one/${urId}`);
        const taxreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new TaxReport(taxreport);
    }
    /**
     * Adds a new tax report to the server.
  
     * @param vals An object that implements the ItaxReport interface.
     * @returns A success response.
     */
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/taxreport/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple tax reports from the server based on the provided array of unique identifiers (_ids).
  
     * @param _ids An array of strings representing the unique identifiers of the tax reports to be deleted.
     * @returns A success response.
     */
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/taxreport/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete('/taxreport/delete/one');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.TaxReport = TaxReport;
//# sourceMappingURL=taxreport.define.js.map