/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelated } from '@open-stock/stock-universal';
/** model interface for invoiceRelated by */
/** */
export type TinvoiceRelated = Document & IinvoiceRelated;
/** main connection for invoiceRelateds Operations*/
export declare let invoiceRelatedMain: Model<TinvoiceRelated>;
/** lean connection for invoiceRelateds Operations*/
export declare let invoiceRelatedLean: Model<TinvoiceRelated>;
/** primary selection object
 * for invoiceRelated
 */
/** */
export declare const invoiceRelatedSelect: {
    creationType: number;
    estimateId: number;
    invoiceId: number;
    billingUser: number;
    billingUserId: number;
    items: number;
    fromDate: number;
    toDate: number;
    status: number;
    stage: number;
    cost: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    payments: number;
};
/** */
export declare const createInvoiceRelatedModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
