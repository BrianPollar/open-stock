/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoicesReport } from '@open-stock/stock-universal';
/** model interface for invoicesReport by */
/** */
export type TinvoicesReport = Document & IinvoicesReport;
/** main connection for invoicesReports Operations*/
export declare let invoicesReportMain: Model<TinvoicesReport>;
/** lean connection for invoicesReports Operations*/
export declare let invoicesReportLean: Model<TinvoicesReport>;
/** primary selection object
 * for invoicesReport
 */
/** */
export declare const invoicesReportSelect: {
    urId: number;
    totalAmount: number;
    date: number;
    invoices: number;
};
/** */
export declare const createInvoicesReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
