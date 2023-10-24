/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
/** TaxReport  class: This class represents a tax report object. It extends the  DatabaseAuto  class, which is not provided in the code snippet. The  TaxReport  class has the following properties:
  -  urId : A string representing the unique identifier of the tax report.
  -  totalAmount : A number representing the total amount of the tax report.
  -  date : A Date object representing the date of the tax report.
  -  estimates : An array of  Estimate  objects representing the estimates related to the tax report.
  -  invoiceRelateds : An array of  InvoiceRelated  objects representing the invoice-related information of the tax report.*/
export class TaxReport extends DatabaseAuto {
    /** TaxReport  constructor: The constructor accepts an object ( data ) that implements the  ItaxReport  interface. It initializes the properties of the  TaxReport  instance based on the provided data.*/
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.estimates) {
            this.estimates = data.estimates
                .map(val => new Estimate(val));
        }
        if (data.invoiceRelateds) {
            this.invoiceRelateds = data.invoiceRelateds
                .map(val => new InvoiceRelatedWithReceipt(val));
        }
    }
    /** getTaxReports : Retrieves multiple tax reports from the server. It accepts optional parameters for the URL, offset, and limit of the request. It returns an array of  TaxReport  instances.*/
    static async getTaxReports(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/taxreport/${url}/${offset}/${limit}`);
        const taxreports = await lastValueFrom(observer$);
        return taxreports
            .map((val) => new TaxReport(val));
    }
    /** getOneTaxReport : Retrieves a single tax report from the server based on the provided unique identifier ( urId ). It returns a  TaxReport  instance.*/
    static async getOneTaxReport(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/taxreport/getone/${urId}`);
        const taxreport = await lastValueFrom(observer$);
        return new TaxReport(taxreport);
    }
    /** addTaxReport : Adds a new tax report to the server. It accepts an object ( vals ) that implements the  ItaxReport  interface. It returns a success response. */
    static async addTaxReport(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/taxreport/create', vals);
        return await lastValueFrom(observer$);
    }
    /** deleteTaxReports : Deletes multiple tax reports from the server based on the provided array of unique identifiers ( ids ). It returns a success response. */
    static async deleteTaxReports(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/taxreport/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=taxreport.define.js.map