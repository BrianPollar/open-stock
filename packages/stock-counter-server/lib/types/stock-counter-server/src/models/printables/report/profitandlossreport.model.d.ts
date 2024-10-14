/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
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
import { IprofitAndLossReport } from '@open-stock/stock-universal';
import { IcompanyIdAsObjectId } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type for the profit and loss report.
 */
export type TprofitandlossReport = Document & IprofitAndLossReport & IcompanyIdAsObjectId;
/**
 * Represents the main profit and loss report model.
 */
export declare let profitandlossReportMain: Model<TprofitandlossReport>;
/**
 * Represents the lean version of the profit and loss report model.
 */
export declare let profitandlossReportLean: Model<TprofitandlossReport>;
/**
 * Selects the profit and loss report.
 */
export declare const profitandlossReportSelect: {
    totalAmount: number;
    date: number;
    expenses: number;
    invoiceRelateds: number;
    currency: number;
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export declare const createProfitandlossReportModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
