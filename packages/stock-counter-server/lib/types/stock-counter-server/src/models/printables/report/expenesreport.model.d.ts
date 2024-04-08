/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IexpenseReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a type for an expense report.
 * Extends the Document interface and the IexpenseReport interface.
 */
export type TexpenseReport = Document & IexpenseReport;
/**
 * Represents the main expense report model.
 */
export declare let expenseReportMain: Model<TexpenseReport>;
/**
 * Represents the lean version of an expense report.
 */
export declare let expenseReportLean: Model<TexpenseReport>;
/**
 * Represents the select statement for the expense report.
 */
export declare const expenseReportSelect: {
    urId: number;
    companyId: number;
    totalAmount: number;
    date: number;
    expenses: number;
};
/**
 * Creates a new expense report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create a main connection for expense report operations.
 * @param lean - Whether to create a lean connection for expense report operations.
 */
export declare const createExpenseReportModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
