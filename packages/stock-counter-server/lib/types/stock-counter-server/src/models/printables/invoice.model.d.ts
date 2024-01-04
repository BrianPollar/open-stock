/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
/**
 * Represents a printable invoice.
 * @typedef {Document & IinvoiceRelatedRef & { dueDate: Date }} Tinvoice
 */
export type Tinvoice = Document & IinvoiceRelatedRef & {
    dueDate: Date;
};
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
    companyId: number;
    invoiceRelated: number;
    dueDate: number;
};
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export declare const createInvoiceModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
