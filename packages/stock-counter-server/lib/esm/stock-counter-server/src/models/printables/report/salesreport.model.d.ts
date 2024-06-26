import { IsalesReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a sales report.
 * @typedef {Document & IsalesReport} TsalesReport
 */
export type TsalesReport = Document & IsalesReport;
/**
 * Represents the main sales report model.
 */
export declare let salesReportMain: Model<TsalesReport>;
/**
 * Represents a lean sales report model.
 */
export declare let salesReportLean: Model<TsalesReport>;
/**
 * Represents the sales report select statement.
 */
export declare const salesReportSelect: {
    urId: number;
    companyId: number;
    totalAmount: number;
    date: number;
    estimates: number;
    invoiceRelateds: number;
};
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export declare const createSalesReportModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
