/// <reference types="mongoose/types/document" />
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
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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
    orderStatus: number;
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a payment related model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export declare const createPaymentRelatedModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
