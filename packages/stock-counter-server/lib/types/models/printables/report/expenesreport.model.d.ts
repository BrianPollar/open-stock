/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IexpenseReport } from '@open-stock/stock-universal';
/** Interface for the expense report document. */
export type TexpenseReport = Document & IexpenseReport;
/** Main connection for expense report operations. */
export declare let expenseReportMain: Model<TexpenseReport>;
/** Lean connection for expense report operations. */
export declare let expenseReportLean: Model<TexpenseReport>;
/** Primary selection object for expense report document. */
export declare const expenseReportSelect: {
    urId: number;
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
export declare const createExpenseReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
