/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IpaymentRelated } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
/** model type for paymentRelated by */
/** */
export type TpaymentRelated = Document & IpaymentRelated & {
    pesaPalorderTrackingId: string;
};
/** main connection for paymentRelateds Operations*/
export declare let paymentRelatedMain: Model<TpaymentRelated>;
/** lean connection for paymentRelateds Operations*/
export declare let paymentRelatedLean: Model<TpaymentRelated>;
/** primary selection object
 * for paymentRelated
 */
/** */
export declare const paymentRelatedSelect: {
    pesaPalorderTrackingId: number;
    urId: number;
    orderDate: number;
    paymentDate: number;
    billingAddress: number;
    shippingAddress: number;
    currency: number;
    isBurgain: number;
    shipping: number;
    manuallyAdded: number;
    paymentMethod: number;
};
/** */
export declare const createPaymentRelatedModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
