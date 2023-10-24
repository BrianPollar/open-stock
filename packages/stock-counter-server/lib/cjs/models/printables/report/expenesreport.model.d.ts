/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IexpenseReport } from '@open-stock/stock-universal';
/** model interface for expenseReport by */
/** */
export type TexpenseReport = Document & IexpenseReport;
/** main connection for expenseReports Operations*/
export declare let expenseReportMain: Model<TexpenseReport>;
/** lean connection for expenseReports Operations*/
export declare let expenseReportLean: Model<TexpenseReport>;
/** primary selection object
 * for expenseReport
 */
/** */
export declare const expenseReportSelect: {
    urId: number;
    totalAmount: number;
    date: number;
    expenses: number;
};
/** */
export declare const createExpenseReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
