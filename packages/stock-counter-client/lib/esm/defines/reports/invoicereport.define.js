import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Invoice } from '../invoice.define';
export class InvoiceReport extends DatabaseAuto {
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
            this.invoices = data.invoices.map(val => new Invoice(val));
        }
        this.currency = data.currency;
    }
    /**
     * Retrieves multiple invoice reports from a server using an HTTP GET request.
     * @static
  
     * @param {string} [url='getall'] - The URL of the HTTP GET request
     * @param {number} [offset=0] - The offset of the HTTP GET request
     * @param {number} [limit=0] - The limit of the HTTP GET request
     * @returns {Promise<InvoiceReport[]>} - An array of InvoiceReport instances
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/all/${offset}/${limit}`);
        const invoicesreports = await lastValueFrom(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesreport/filter', filter);
        const invoicesreports = await lastValueFrom(observer$);
        return {
            count: invoicesreports.count,
            invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
        };
    }
    /**
     * Retrieves a single invoice report from a server using an HTTP GET request.
     * @static
  
     * @param {string} urId - The unique identifier of the invoice report to retrieve
     * @returns {Promise<InvoiceReport>} - An InvoiceReport instance
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/one/${urId}`);
        const invoicesreport = await lastValueFrom(observer$);
        return new InvoiceReport(invoicesreport);
    }
    /**
     * Adds a new invoice report to the server using an HTTP POST request.
     * @static
  
     * @param {IinvoicesReport} vals - The data of the new invoice report
     * @returns {Promise<Isuccess>} - A success response
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesreport/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple invoice reports from the server using an HTTP PUT request.
     * @static
  
     * @param {string[]} _ids - An array of report IDs to be deleted
     * @returns {Promise<Isuccess>} - A success response
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesreport/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/invoicesreport/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=invoicereport.define.js.map