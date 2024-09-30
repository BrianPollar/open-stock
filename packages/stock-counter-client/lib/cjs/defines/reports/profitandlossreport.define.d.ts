import { DatabaseAuto, IdeleteMany, IfilterProps, IprofitAndLossReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class ProfitAndLossReport extends DatabaseAuto {
    urId: string;
    /** The user's company ID. */
    companyId: string;
    totalAmount: number;
    date: Date;
    expenses: Expense[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    readonly currency: string;
    /**
     * Creates a new instance of ProfitAndLossReport.
     * @param data - The data to initialize the report with.
     */
    constructor(data: IprofitAndLossReport);
    /**
     * Retrieves profit and loss reports from the server.
  
     * @param url - The API endpoint to use. Defaults to 'getall'.
     * @param offset - The offset to use for pagination. Defaults to 0.
     * @param limit - The limit to use for pagination. Defaults to 0.
     * @returns An array of ProfitAndLossReport instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        profitandlossreports: ProfitAndLossReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        profitandlossreports: ProfitAndLossReport[];
    }>;
    /**
     * Retrieves a single profit and loss report based on the provided urId.
  
     * @param urId - The ID of the report to retrieve.
     * @returns A ProfitAndLossReport instance.
     */
    static getOne(urId: string): Promise<ProfitAndLossReport>;
    /**
     * Adds a new profit and loss report to the server.
  
     * @param vals - The data for the new report.
     * @returns An Isuccess object.
     */
    static add(vals: IprofitAndLossReport): Promise<Isuccess>;
    /**
     * Deletes multiple profit and loss reports from the server.
  
     * @param _ids - An array of report IDs to be deleted.
     * @returns An Isuccess object.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
