import { Estimate } from '../estimate.define';
import { DatabaseAuto, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
/** The  SalesReport  class represents a sales report object. It extends the  DatabaseAuto  class (which is not shown in the code) and adds properties specific to sales reports, such as  urId ,  totalAmount ,  date ,  estimates , and  invoiceRelateds . The constructor takes a data object that implements the  IsalesReport  interface (not shown in the code) and initializes the class properties based on the data. */
export declare class SalesReport extends DatabaseAuto {
    urId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    constructor(data: IsalesReport);
    /** getSalesReports  retrieves multiple sales reports from the server. It takes optional parameters for the URL, offset, and limit of the request. It uses the  makeGet  method of the  StockCounterClient.ehttp object (not shown in the code) to make an HTTP GET request to the specified URL with the offset and limit parameters. It then converts the response to an array of  IsalesReport  objects, creates new instances of the  SalesReport  class for each object, and returns an array of  SalesReport  instances. */
    static getSalesReports(url?: string, offset?: number, limit?: number): Promise<SalesReport[]>;
    /** getOneSalesReport  retrieves a single sales report from the server. It takes the  urId  parameter to specify the ID of the report to retrieve. It uses the  makeGet  method of the  StockCounterClient.ehttp object to make an HTTP GET request to the specified URL with the  urId  parameter. It then converts the response to an  IsalesReport  object, creates a new instance of the  SalesReport  class with the object data, and returns the instance.*/
    static getOneSalesReport(urId: string): Promise<SalesReport>;
    /** addSalesReport  adds a new sales report to the server. It takes the  vals  parameter, which is an object that represents the data of the new report. It uses the  makePost  method of the  StockCounterClient.ehttp object to make an HTTP POST request to the specified URL with the  vals  data. It then converts the response to an  Isuccess  object and returns it.*/
    static addSalesReport(vals: IsalesReport): Promise<Isuccess>;
    /** deleteSalesReports  deletes multiple sales reports from the server. It takes the  ids  parameter, which is an array of IDs of the reports to delete. It uses the  makePut  method of the  StockCounterClient.ehttp object to make an HTTP PUT request to the specified URL with the  ids  data. It then converts the response to an  Isuccess  object and returns it.*/
    static deleteSalesReports(ids: string[]): Promise<Isuccess>;
}
