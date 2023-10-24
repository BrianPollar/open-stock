import { Invoice } from '../invoice.define';
import { DatabaseAuto, IinvoicesReport, Isuccess } from '@open-stock/stock-universal';
/** InvoiceReport  class: This class represents an invoice report object. It extends the  DatabaseAuto  class (not provided in the code) and has properties such as  urId ,  totalAmount ,  date , and  invoices . It also has a constructor that initializes these properties based on the provided data*/
export declare class InvoiceReport extends DatabaseAuto {
    urId: string;
    totalAmount: number;
    date: Date;
    invoices: Invoice[];
    constructor(data: IinvoicesReport);
    /** getInvoiceReports  static method: This method retrieves multiple invoice reports from a server using an HTTP GET request. It takes optional parameters for the URL, offset, and limit of the request. It returns an array of  InvoiceReport  instances.*/
    static getInvoiceReports(url?: string, offset?: number, limit?: number): Promise<InvoiceReport[]>;
    /** getOneInvoiceReport  static method: This method retrieves a single invoice report from a server using an HTTP GET request. It takes the  urId  parameter to identify the specific report. It returns an  InvoiceReport  instance. */
    static getOneInvoiceReport(urId: string): Promise<InvoiceReport>;
    /** addInvoiceReport  static method: This method adds a new invoice report to the server using an HTTP POST request. It takes the  vals  parameter, which represents the data of the new report. It returns a success response.*/
    static addInvoiceReport(vals: IinvoicesReport): Promise<Isuccess>;
    /** deleteInvoiceReports  static method: This method deletes multiple invoice reports from the server using an HTTP PUT request. It takes the  ids  parameter, which is an array of report IDs to be deleted. It returns a success response.*/
    static deleteInvoiceReports(ids: string[]): Promise<Isuccess>;
}
