/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoicesReport } from '@open-stock/stock-universal';
/** Model interface for invoicesReport */
export type TinvoicesReport = Document & IinvoicesReport;
/** Main connection for invoicesReports Operations */
export declare let invoicesReportMain: Model<TinvoicesReport>;
/** Lean connection for invoicesReports Operations */
export declare let invoicesReportLean: Model<TinvoicesReport>;
/** Primary selection object for invoicesReport */
export declare const invoicesReportSelect: {
    urId: number;
    totalAmount: number;
    date: number;
    invoices: number;
};
/**
 * Creates a new invoices report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection for invoicesReports Operations.
 * @param lean - Whether to create the lean connection for invoicesReports Operations.
 */
export declare const createInvoicesReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
