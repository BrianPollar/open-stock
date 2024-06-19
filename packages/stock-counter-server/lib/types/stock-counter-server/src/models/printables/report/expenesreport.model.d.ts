/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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
