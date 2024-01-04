/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
/**
 * Represents a testimate, which is a document related to an invoice.
 */
export type Testimate = Document & IinvoiceRelatedRef;
/**
 * Represents the main estimate model.
 */
export declare let estimateMain: Model<Testimate>;
/**
 * Represents an estimateLean model.
 */
export declare let estimateLean: Model<Testimate>;
/**
 * Represents the estimate select function.
 */
export declare const estimateSelect: {
    companyId: number;
    invoiceRelated: number;
};
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
export declare const createEstimateModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
