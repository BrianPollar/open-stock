import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export class SalesReport extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.estimates) {
            this.estimates = data.estimates.map((val) => new Estimate(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map((val) => new InvoiceRelatedWithReceipt(val));
        }
        this.currency = data.currency;
    }
    /**
     * Retrieves multiple sales reports from the server.
  
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of `SalesReport` instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/salesreport/all/${offset}/${limit}`);
        const salesreports = await lastValueFrom(observer$);
        return {
            count: salesreports.count,
            salesreports: salesreports.data.map((val) => new SalesReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/salesreport/filter', filter);
        const salesreports = await lastValueFrom(observer$);
        return {
            count: salesreports.count,
            salesreports: salesreports.data.map((val) => new SalesReport(val))
        };
    }
    /**
     * Retrieves a single sales report from the server.
  
     * @param urId The ID of the report to retrieve.
     * @returns A `SalesReport` instance.
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/salesreport/one/${urId}`);
        const salesreport = await lastValueFrom(observer$);
        return new SalesReport(salesreport);
    }
    /**
     * Adds a new sales report to the server.
  
     * @param vals An object that represents the data of the new report.
     * @returns An `Isuccess` object.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/salesreport/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple sales reports from the server.
  
     * @param _ids An array of IDs of the reports to delete.
     * @returns An `Isuccess` object.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/salesreport/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete('/salesreport/delete/one');
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=salesreport.define.js.map