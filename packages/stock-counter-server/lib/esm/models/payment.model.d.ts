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
export declare const createPaymentModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
