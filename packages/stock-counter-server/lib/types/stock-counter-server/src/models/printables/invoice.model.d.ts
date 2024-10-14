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
import { IcompanyIdAsObjectId } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a printable invoice.
 * @typedef {Document & IinvoiceRelatedRef & { dueDate: Date }} Tinvoice
 */
export type Tinvoice = Document & IinvoiceRelatedRef & {
    dueDate: Date;
} & IcompanyIdAsObjectId;
/**
 * Represents the main invoice model.
 */
export declare let invoiceMain: Model<Tinvoice>;
/**
 * Represents a lean invoice model.
 */
export declare let invoiceLean: Model<Tinvoice>;
/**
 * Represents the invoice select function.
 */
export declare const invoiceSelect: {
    trackEdit: number;
    trackView: number;
    companyId: number;
    invoiceRelated: number;
    dueDate: number;
};
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export declare const createInvoiceModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
