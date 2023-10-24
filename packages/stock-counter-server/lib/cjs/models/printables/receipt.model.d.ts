/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
/** model type for receipt by*/
/** */
export type Treceipt = Document & IurId & IinvoiceRelatedRef & {
    ammountRcievd: number;
    paymentMode: string;
    type: string;
    date: Date;
    amount: number;
};
/** main connection for receipts Operations*/
export declare let receiptMain: Model<Treceipt>;
/** lean connection for receipts Operations*/
export declare let receiptLean: Model<Treceipt>;
/** primary selection object
 * for receipt
 */
/** */
export declare const receiptSelect: {
    urId: number;
    invoiceRelated: number;
    ammountRcievd: number;
    paymentMode: number;
    type: number;
    amount: number;
    date: number;
};
/** */
export declare const createReceiptModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
