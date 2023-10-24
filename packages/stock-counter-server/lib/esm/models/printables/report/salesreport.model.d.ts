/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IsalesReport } from '@open-stock/stock-universal';
/** model interface for salesReport by */
/** */
export type TsalesReport = Document & IsalesReport;
/** main connection for salesReports Operations*/
export declare let salesReportMain: Model<TsalesReport>;
/** lean connection for salesReports Operations*/
export declare let salesReportLean: Model<TsalesReport>;
/** primary selection object
 * for salesReport
 */
/** */
export declare const salesReportSelect: {
    urId: number;
    totalAmount: number;
    date: number;
    estimates: number;
    invoiceRelateds: number;
};
/** */
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export declare const createSalesReportModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
