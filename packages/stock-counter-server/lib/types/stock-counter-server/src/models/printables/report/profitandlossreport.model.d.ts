import { IprofitAndLossReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type for the profit and loss report.
 */
export type TprofitandlossReport = Document & IprofitAndLossReport;
/**
 * Represents the main profit and loss report model.
 */
export declare let profitandlossReportMain: Model<TprofitandlossReport>;
/**
 * Represents the lean version of the profit and loss report model.
 */
export declare let profitandlossReportLean: Model<TprofitandlossReport>;
/**
 * Selects the profit and loss report.
 */
export declare const profitandlossReportSelect: {
    urId: number;
    companyId: number;
    totalAmount: number;
    date: number;
    expenses: number;
    invoiceRelateds: number;
};
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export declare const createProfitandlossReportModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
