"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const estimate_define_1 = require("../estimate.define");
const invoice_define_1 = require("../invoice.define");
/**
 * The `SalesReport` class represents a sales report object.
 * It extends the `DatabaseAuto` class and adds properties specific to sales reports, such as `urId`, `totalAmount`, `date`, `estimates`, and `invoiceRelateds`.
 * The constructor takes a data object that implements the `IsalesReport` interface and initializes the class properties based on the data.
 */
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
    /**
     * Retrieves multiple sales reports from the server.
     * @param companyId - The ID of the company
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of `SalesReport` instances.
     */
    static async getSalesReports(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/salesreport/${url}/${offset}/${limit}/${companyId}`);
        const salesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: salesreports.count,
            salesreports: salesreports.data.map((val) => new SalesReport(val))
        };
    }
    /**
     * Retrieves a single sales report from the server.
     * @param companyId - The ID of the company
     * @param urId The ID of the report to retrieve.
     * @returns A `SalesReport` instance.
     */
    static async getOneSalesReport(companyId, urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/salesreport/getone/${urId}/${companyId}`);
        const salesreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new SalesReport(salesreport);
    }
    /**
     * Adds a new sales report to the server.
     * @param companyId - The ID of the company
     * @param vals An object that represents the data of the new report.
     * @returns An `Isuccess` object.
     */
    static async addSalesReport(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/salesreport/create/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple sales reports from the server.
     * @param companyId - The ID of the company
     * @param ids An array of IDs of the reports to delete.
     * @returns An `Isuccess` object.
     */
    static async deleteSalesReports(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/salesreport/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.SalesReport = SalesReport;
//# sourceMappingURL=salesreport.define.js.map