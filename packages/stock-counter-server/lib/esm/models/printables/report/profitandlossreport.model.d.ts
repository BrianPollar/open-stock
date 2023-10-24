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
export declare const createProfitandlossReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
