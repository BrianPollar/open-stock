import { IinvoicesReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a TinvoicesReport, which is a document that combines the properties of a Document and IinvoicesReport.
 */
export type TinvoicesReport = Document & IinvoicesReport;
/**
 * Represents the main invoice report.
 */
export declare let invoicesReportMain: Model<TinvoicesReport>;
/**
 * Represents the lean version of the invoices report model.
 */
export declare let invoicesReportLean: Model<TinvoicesReport>;
/**
 * Select statement for generating invoices report.
 */
export declare const invoicesReportSelect: {
    urId: number;
    companyId: number;
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
export declare const createInvoicesReportModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
