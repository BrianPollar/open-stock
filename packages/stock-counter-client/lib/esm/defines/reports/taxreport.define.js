import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export class TaxReport extends DatabaseAuto {
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
            this.estimates = data.estimates.map((val) => new Estimate(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds.map((val) => new InvoiceRelatedWithReceipt(val));
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
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/taxreport/all/${offset}/${limit}`);
        const taxreports = await lastValueFrom(observer$);
        return {
            count: taxreports.count,
            taxreports: taxreports.data.map((val) => new TaxReport(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/taxreport/filter', filter);
        const taxreports = await lastValueFrom(observer$);
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
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/taxreport/one/${urId}`);
        const taxreport = await lastValueFrom(observer$);
        return new TaxReport(taxreport);
    }
    /**
     * Adds a new tax report to the server.
  
     * @param vals An object that implements the ItaxReport interface.
     * @returns A success response.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/taxreport/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple tax reports from the server based on the provided array of unique identifiers (_ids).
  
     * @param _ids An array of strings representing the unique identifiers of the tax reports to be deleted.
     * @returns A success response.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/taxreport/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete('/taxreport/delete/one');
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=taxreport.define.js.map