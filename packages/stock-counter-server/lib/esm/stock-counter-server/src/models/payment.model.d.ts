/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a payment document.
 */
export type Tpayment = Document & {
    companyId: string;
    paymentRelated: string | IpaymentRelated;
    invoiceRelated: string | IinvoiceRelated;
    order: string;
};
/**
 * Represents the main payment model.
 */
export declare let paymentMain: Model<Tpayment>;
/**
 * Represents a lean payment model.
 */
export declare let paymentLean: Model<Tpayment>;
/**
 * Represents a payment select function.
 */
export declare const paymentSelect: {
    companyId: number;
    paymentRelated: number;
    invoiceRelated: number;
    order: number;
};
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export declare const createPaymentModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
