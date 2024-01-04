import { InvoiceRelatedWithReceipt } from '../invoice.define';
import { DatabaseAuto, IprofitAndLossReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
/** The  ProfitAndLossReport  class extends the  DatabaseAuto  class. It has properties such as  urId ,  totalAmount ,  date ,  expenses , and  invoiceRelateds . The constructor takes an object  data  as an argument and assigns its properties to the corresponding class properties. It also converts the  expenses  and  invoiceRelateds  arrays into instances of the  Expense  and  InvoiceRelated  classes, respectively.

The class has several static methods:
-  getProfitAndLossReports : Retrieves profit and loss reports from the server. It takes optional parameters  url ,  offset , and  limit  to specify the API endpoint and pagination options. */
/**
 * Represents a Profit and Loss Report.
 */
export declare class ProfitAndLossReport extends DatabaseAuto {
    urId: string;
    /** The user's company ID. */
    companyId: string;
    totalAmount: number;
    date: Date;
    expenses: Expense[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    /**
     * Creates a new instance of ProfitAndLossReport.
     * @param data - The data to initialize the report with.
     */
    constructor(data: IprofitAndLossReport);
    /**
     * Retrieves profit and loss reports from the server.
     * @param companyId - The ID of the company
     * @param url - The API endpoint to use. Defaults to 'getall'.
     * @param offset - The offset to use for pagination. Defaults to 0.
     * @param limit - The limit to use for pagination. Defaults to 0.
     * @returns An array of ProfitAndLossReport instances.
     */
    static getProfitAndLossReports(companyId: string, url?: string, offset?: number, limit?: number): Promise<ProfitAndLossReport[]>;
    /**
     * Retrieves a single profit and loss report based on the provided urId.
     * @param companyId - The ID of the company
     * @param urId - The ID of the report to retrieve.
     * @returns A ProfitAndLossReport instance.
     */
    static getOneProfitAndLossReport(companyId: string, urId: string): Promise<ProfitAndLossReport>;
    /**
     * Adds a new profit and loss report to the server.
     * @param companyId - The ID of the company
     * @param vals - The data for the new report.
     * @returns An Isuccess object.
     */
    static addProfitAndLossReport(companyId: string, vals: IprofitAndLossReport): Promise<Isuccess>;
    /**
     * Deletes multiple profit and loss reports from the server.
     * @param companyId - The ID of the company
     * @param ids - An array of report IDs to be deleted.
     * @returns An Isuccess object.
     */
    static deleteProfitAndLossReports(companyId: string, ids: string[]): Promise<Isuccess>;
}
