/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
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
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a receipt document.
 */
export type Treceipt = Document & IurId & IinvoiceRelatedRef & {
    /**
     * The amount received.
     */
    ammountRcievd: number;
    /**
     * The payment mode.
     */
    paymentMode: string;
    /**
     * The type of receipt.
     */
    type: string;
    /**
     * The date of the receipt.
     */
    date: Date;
    /**
     * The total amount.
     */
    amount: number;
};
/**
 * Represents the main receipt model.
 */
export declare let receiptMain: Model<Treceipt>;
/**
 * Represents a lean receipt model.
 */
export declare let receiptLean: Model<Treceipt>;
/**
 * Represents the receipt select function.
 */
export declare const receiptSelect: {
    trackEdit: number;
    trackView: number;
    urId: number;
    companyId: number;
    invoiceRelated: number;
    ammountRcievd: number;
    paymentMode: number;
    type: number;
    amount: number;
    date: number;
};
/**
 * Creates a new receipt model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export declare const createReceiptModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
