/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IprofitAndLossReport } from '@open-stock/stock-universal';
/** model interface for profitandlossReport by */
/** */
export type TprofitandlossReport = Document & IprofitAndLossReport;
/** main connection for profitandlossReports Operations*/
export declare let profitandlossReportMain: Model<TprofitandlossReport>;
/** lean connection for profitandlossReports Operations*/
export declare let profitandlossReportLean: Model<TprofitandlossReport>;
/** primary selection object
 * for profitandlossReport
 */
/** */
export declare const profitandlossReportSelect: {
    urId: number;
    totalAmount: number;
    date: number;
    expenses: number;
    invoiceRelateds: number;
};
/** */
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export declare const createProfitandlossReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
