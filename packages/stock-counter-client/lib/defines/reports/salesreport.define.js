/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { Estimate } from '../estimate.define';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockCounterClient } from '../../stock-counter-client';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
/** The  SalesReport  class represents a sales report object. It extends the  DatabaseAuto  class (which is not shown in the code) and adds properties specific to sales reports, such as  urId ,  totalAmount ,  date ,  estimates , and  invoiceRelateds . The constructor takes a data object that implements the  IsalesReport  interface (not shown in the code) and initializes the class properties based on the data. */
export class SalesReport extends DatabaseAuto {
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
    /** getSalesReports  retrieves multiple sales reports from the server. It takes optional parameters for the URL, offset, and limit of the request. It uses the  makeGet  method of the  StockCounterClient.ehttp object (not shown in the code) to make an HTTP GET request to the specified URL with the offset and limit parameters. It then converts the response to an array of  IsalesReport  objects, creates new instances of the  SalesReport  class for each object, and returns an array of  SalesReport  instances. */
    static async getSalesReports(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/salesreport/${url}/${offset}/${limit}`);
        const salesreports = await lastValueFrom(observer$);
        return salesreports
            .map((val) => new SalesReport(val));
    }
    /** getOneSalesReport  retrieves a single sales report from the server. It takes the  urId  parameter to specify the ID of the report to retrieve. It uses the  makeGet  method of the  StockCounterClient.ehttp object to make an HTTP GET request to the specified URL with the  urId  parameter. It then converts the response to an  IsalesReport  object, creates a new instance of the  SalesReport  class with the object data, and returns the instance.*/
    static async getOneSalesReport(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/salesreport/getone/${urId}`);
        const salesreport = await lastValueFrom(observer$);
        return new SalesReport(salesreport);
    }
    /** addSalesReport  adds a new sales report to the server. It takes the  vals  parameter, which is an object that represents the data of the new report. It uses the  makePost  method of the  StockCounterClient.ehttp object to make an HTTP POST request to the specified URL with the  vals  data. It then converts the response to an  Isuccess  object and returns it.*/
    static async addSalesReport(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/salesreport/create', vals);
        return await lastValueFrom(observer$);
    }
    /** deleteSalesReports  deletes multiple sales reports from the server. It takes the  ids  parameter, which is an array of IDs of the reports to delete. It uses the  makePut  method of the  StockCounterClient.ehttp object to make an HTTP PUT request to the specified URL with the  ids  data. It then converts the response to an  Isuccess  object and returns it.*/
    static async deleteSalesReports(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/salesreport/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=salesreport.define.js.map