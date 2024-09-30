import { DatabaseAuto, IdeleteMany, IfilterProps, IprofitAndLossReport, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class ProfitAndLossReport extends DatabaseAuto {
    urId: string;
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
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        profitandlossreports: ProfitAndLossReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        profitandlossreports: ProfitAndLossReport[];
    }>;
    static getOne(urId: string): Promise<ProfitAndLossReport>;
    static add(vals: IprofitAndLossReport): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
