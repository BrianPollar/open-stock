"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceReport = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const invoice_define_1 = require("../invoice.define");
/**
 * InvoiceReport  class: This class represents an invoice report object.
 * It extends the  DatabaseAuto  class (not provided in the code) and has properties such as  urId ,  totalAmount ,  date , and  invoices .
 * It also has a constructor that initializes these properties based on the provided data
 */
class InvoiceReport extends stock_universal_1.DatabaseAuto {
    /**
     * Creates an instance of InvoiceReport.
     * @param {IinvoicesReport} data - The data used to initialize the properties of the invoice report
     */
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
    /**
     * Retrieves multiple invoice reports from a server using an HTTP GET request.
     * @static
     * @param companyId - The ID of the company
     * @param {string} [url='getall'] - The URL of the HTTP GET request
     * @param {number} [offset=0] - The offset of the HTTP GET request
     * @param {number} [limit=0] - The limit of the HTTP GET request
     * @returns {Promise<InvoiceReport[]>} - An array of InvoiceReport instances
     */
    static async getInvoiceReports(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/invoicesreport/${url}/${offset}/${limit}/${companyId}`);
        const invoicesreports = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    /**
     * Retrieves a single invoice report from a server using an HTTP GET request.
     * @static
     * @param companyId - The ID of the company
     * @param {string} urId - The unique identifier of the invoice report to retrieve
     * @returns {Promise<InvoiceReport>} - An InvoiceReport instance
     */
    static async getOneInvoiceReport(companyId, urId) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makeGet(`/invoicesreport/getone/${urId}/${companyId}`);
        const invoicesreport = await (0, rxjs_1.lastValueFrom)(observer$);
        return new InvoiceReport(invoicesreport);
    }
    /**
     * Adds a new invoice report to the server using an HTTP POST request.
     * @static
     * @param companyId - The ID of the company
     * @param {IinvoicesReport} vals - The data of the new invoice report
     * @returns {Promise<Isuccess>} - A success response
     */
    static async addInvoiceReport(companyId, vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePost(`/invoicesreport/create/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes multiple invoice reports from the server using an HTTP PUT request.
     * @static
     * @param companyId - The ID of the company
     * @param {string[]} ids - An array of report IDs to be deleted
     * @returns {Promise<Isuccess>} - A success response
     */
    static async deleteInvoiceReports(companyId, ids) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp.makePut(`/invoicesreport/deletemany/${companyId}`, { ids });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.InvoiceReport = InvoiceReport;
//# sourceMappingURL=invoicereport.define.js.map