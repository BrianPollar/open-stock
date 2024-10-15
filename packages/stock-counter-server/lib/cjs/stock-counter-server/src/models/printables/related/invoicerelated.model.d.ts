/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/schematypes" />
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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IinvoiceRelated } from '@open-stock/stock-universal';
import { IcompanyIdAsObjectId } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
/** model interface for invoiceRelated by */
export type TinvoiceRelated = Document & Omit<IinvoiceRelated, 'billingUserId'> & IcompanyIdAsObjectId & {
    billingUserId: Schema.Types.ObjectId;
};
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
    ecommerceSale: number;
    ecommerceSalePercentage: number;
    currency: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates the InvoiceRelated model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export declare const createInvoiceRelatedModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
