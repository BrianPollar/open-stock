import { InvoiceRelatedWithReceipt } from '../invoice.define';
import { DatabaseAuto, IprofitAndLossReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
/** The  ProfitAndLossReport  class extends the  DatabaseAuto  class. It has properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The constructor takes an object  data  as an argument and assigns its properties to the corresponding class properties. It also converts the  expenses  and  invoiceRelateds  arrays into instances of the  Expense  and  InvoiceRelated  classes, respectively.

The class has several static methods:
-  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
export declare class ProfitAndLossReport extends DatabaseAuto {
    urId: string;
    totalAmount: number;
    date: Date;
    expenses: Expense[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    constructor(data: IprofitAndLossReport);
    /**
  The class has several static methods:
  -  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
    static getProfitAndLossReports(url?: string, offset?: number, limit?: number): Promise<ProfitAndLossReport[]>;
    /** getOneProfitAndLossReport : Retrieves a single profit and loss report based on the provided  urId . */
    static getOneProfitAndLossReport(urId: string): Promise<ProfitAndLossReport>;
    /** addProfitAndLossReport : Adds a new profit and loss report to the server. It takes an object  vals  containing the report data.*/
    static addProfitAndLossReport(vals: IprofitAndLossReport): Promise<Isuccess>;
    /** deleteProfitAndLossReports : Deletes multiple profit and loss reports from the server. It takes an array of report IDs to be deleted.*/
    static deleteProfitAndLossReports(ids: string[]): Promise<Isuccess>;
}
