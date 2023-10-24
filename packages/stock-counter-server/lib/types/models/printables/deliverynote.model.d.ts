/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
/** model interface for deliveryNote by */
/** */
export type TdeliveryNote = Document & IurId & IinvoiceRelatedRef;
/** main connection for deliveryNotes Operations*/
export declare let deliveryNoteMain: Model<TdeliveryNote>;
/** lean connection for deliveryNotes Operations*/
export declare let deliveryNoteLean: Model<TdeliveryNote>;
/** primary selection object
 * for deliveryNote
 */
/** */
export declare const deliveryNoteSelect: {
    urId: number;
    invoiceRelated: number;
};
/** */
export declare const createDeliveryNoteModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
