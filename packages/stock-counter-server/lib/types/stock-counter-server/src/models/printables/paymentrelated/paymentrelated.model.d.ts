/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IpaymentRelated } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/** model type for paymentRelated by */
export type TpaymentRelated = Document & IpaymentRelated & {
    pesaPalorderTrackingId: string;
};
/**
 * Represents the main payment related model.
 */
export declare let paymentRelatedMain: Model<TpaymentRelated>;
/**
 * Represents the payment related lean model.
 */
export declare let paymentRelatedLean: Model<TpaymentRelated>;
/**
 * Represents the payment related select function.
 */
export declare const paymentRelatedSelect: {
    pesaPalorderTrackingId: number;
    urId: number;
    companyId: number;
    orderDate: number;
    paymentDate: number;
    billingAddress: number;
    shippingAddress: number;
    currency: number;
    isBurgain: number;
    shipping: number;
    manuallyAdded: number;
    paymentMethod: number;
    payType: number;
};
/**
 * Creates a payment related model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export declare const createPaymentRelatedModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
