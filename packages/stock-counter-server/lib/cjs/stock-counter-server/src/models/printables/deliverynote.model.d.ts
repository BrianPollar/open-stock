/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a delivery note.
 * @typedef {Document & IurId & IinvoiceRelatedRef} TdeliveryNote
 */
export type TdeliveryNote = Document & IurId & IinvoiceRelatedRef;
/**
 * Represents the main delivery note model.
 */
export declare let deliveryNoteMain: Model<TdeliveryNote>;
/**
 * Represents a lean delivery note model.
 */
export declare let deliveryNoteLean: Model<TdeliveryNote>;
/**
 * Selects the delivery note.
 */
export declare const deliveryNoteSelect: {
    urId: number;
    companyId: number;
    invoiceRelated: number;
};
/**
 * Creates a delivery note model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export declare const createDeliveryNoteModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
