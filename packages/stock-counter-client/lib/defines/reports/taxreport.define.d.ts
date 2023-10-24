import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
import { DatabaseAuto, Isuccess, ItaxReport } from '@open-stock/stock-universal';
/** TaxReport  class: This class represents a tax report object. It extends the  DatabaseAuto  class, which is not provided in the code snippet. The  TaxReport  class has the following properties:
  -  urId : A string representing the unique identifier of the tax report.
  -  totalAmount : A number representing the total amount of the tax report.
  -  date : A Date object representing the date of the tax report.
  -  estimates : An array of  Estimate  objects representing the estimates related to the tax report.
  -  invoiceRelateds : An array of  InvoiceRelated  objects representing the invoice-related information of the tax report.*/
export declare class TaxReport extends DatabaseAuto {
    urId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    /** TaxReport  constructor: The constructor accepts an object ( data ) that implements the  ItaxReport  interface. It initializes the properties of the  TaxReport  instance based on the provided data.*/
    constructor(data: ItaxReport);
    /** getTaxReports : Retrieves multiple tax reports from the server. It accepts optional parameters for the URL, offset, and limit of the request. It returns an array of  TaxReport  instances.*/
    static getTaxReports(url?: string, offset?: number, limit?: number): Promise<TaxReport[]>;
    /** getOneTaxReport : Retrieves a single tax report from the server based on the provided unique identifier ( urId ). It returns a  TaxReport  instance.*/
    static getOneTaxReport(urId: string): Promise<TaxReport>;
    /** addTaxReport : Adds a new tax report to the server. It accepts an object ( vals ) that implements the  ItaxReport  interface. It returns a success response. */
    static addTaxReport(vals: ItaxReport): Promise<Isuccess>;
    /** deleteTaxReports : Deletes multiple tax reports from the server based on the provided array of unique identifiers ( ids ). It returns a success response. */
    static deleteTaxReports(ids: string[]): Promise<Isuccess>;
}
