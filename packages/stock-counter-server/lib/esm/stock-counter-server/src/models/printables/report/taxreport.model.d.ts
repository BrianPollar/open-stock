/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { ItaxReport } from '@open-stock/stock-universal';
/**
 * Represents a tax report.
 */
export type TtaxReport = Document & ItaxReport;
/**
 * Represents the main tax report model.
 */
export declare let taxReportMain: Model<TtaxReport>;
/**
 * Represents a lean tax report model.
 */
export declare let taxReportLean: Model<TtaxReport>;
/** primary selection object
 * for taxReport
 */
export declare const taxReportSelect: {
    urId: number;
    companyId: number;
    totalAmount: number;
    date: number;
    estimates: number;
    invoiceRelateds: number;
};
/**
 * Creates a tax report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export declare const createTaxReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
