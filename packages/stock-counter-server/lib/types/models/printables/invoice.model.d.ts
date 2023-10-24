/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
/** model type for invoice by */
/** */
export type Tinvoice = Document & IinvoiceRelatedRef & {
    dueDate: Date;
};
/** main connection for invoices Operations*/
export declare let invoiceMain: Model<Tinvoice>;
/** lean connection for invoices Operations*/
export declare let invoiceLean: Model<Tinvoice>;
/** primary selection object
 * for invoice
 */
/** */
export declare const invoiceSelect: {
    invoiceRelated: number;
    dueDate: number;
};
/** */
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export declare const createInvoiceModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
