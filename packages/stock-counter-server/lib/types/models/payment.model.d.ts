/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
/** model type for payment by*/
/** */
export type Tpayment = Document & {
    paymentRelated: string | IpaymentRelated;
    invoiceRelated: string | IinvoiceRelated;
    order: string;
};
/** main connection for payments Operations*/
export declare let paymentMain: Model<Tpayment>;
/** lean connection for payments Operations*/
export declare let paymentLean: Model<Tpayment>;
/** primary selection object
 * for payment
 */
/** */
export declare const paymentSelect: {
    paymentRelated: number;
    invoiceRelated: number;
    order: number;
};
/** */
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export declare const createPaymentModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
