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
