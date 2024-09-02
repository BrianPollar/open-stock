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
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
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
    invoiceRelated: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
export declare const createEstimateModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
