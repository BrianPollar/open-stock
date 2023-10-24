/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { Invoice } from '../invoice.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
/** InvoiceReport  class: This class represents an invoice report object. It extends the  DatabaseAuto  class (not provided in the code) and has properties such as  urId ,  totalAmount ,  date , and  invoices . It also has a constructor that initializes these properties based on the provided data*/
export class InvoiceReport extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.totalAmount = data.totalAmount;
        this.date = data.date;
        if (data.invoices) {
            this.invoices = data.invoices
                .map(val => new Invoice(val));
        }
    }
    /** getInvoiceReports  static method: This method retrieves multiple invoice reports from a server using an HTTP GET request. It takes optional parameters for the URL, offset, and limit of the request. It returns an array of  InvoiceReport  instances.*/
    static async getInvoiceReports(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/${url}/${offset}/${limit}`);
        const invoicesreports = await lastValueFrom(observer$);
        return invoicesreports
            .map((val) => new InvoiceReport(val));
    }
    /** getOneInvoiceReport  static method: This method retrieves a single invoice report from a server using an HTTP GET request. It takes the  urId  parameter to identify the specific report. It returns an  InvoiceReport  instance. */
    static async getOneInvoiceReport(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/invoicesreport/getone/${urId}`);
        const invoicesreport = await lastValueFrom(observer$);
        return new InvoiceReport(invoicesreport);
    }
    /** addInvoiceReport  static method: This method adds a new invoice report to the server using an HTTP POST request. It takes the  vals  parameter, which represents the data of the new report. It returns a success response.*/
    static async addInvoiceReport(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoicesreport/create', vals);
        return await lastValueFrom(observer$);
    }
    /** deleteInvoiceReports  static method: This method deletes multiple invoice reports from the server using an HTTP PUT request. It takes the  ids  parameter, which is an array of report IDs to be deleted. It returns a success response.*/
    static async deleteInvoiceReports(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicesreport/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=invoicereport.define.js.map