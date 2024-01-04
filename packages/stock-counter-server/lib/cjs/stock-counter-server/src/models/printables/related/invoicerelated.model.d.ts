/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelated } from '@open-stock/stock-universal';
/** model interface for invoiceRelated by */
export type TinvoiceRelated = Document & IinvoiceRelated;
/**
 * Represents the main invoice related model.
 */
export declare let invoiceRelatedMain: Model<TinvoiceRelated>;
/**
 * Represents a lean version of the invoice related model.
 */
export declare let invoiceRelatedLean: Model<TinvoiceRelated>;
/**
 * Selects the invoice related fields for querying.
 */
export declare const invoiceRelatedSelect: {
    companyId: number;
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
    payType: number;
};
/**
 * Creates the InvoiceRelated model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export declare const createInvoiceRelatedModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
