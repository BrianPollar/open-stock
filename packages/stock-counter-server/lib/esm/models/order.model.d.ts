/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
/** model type for order by */
/** */
export type Torder = Document & {
    paymentRelated: string | IpaymentRelated;
    invoiceRelated: string | IinvoiceRelated;
    deliveryDate: Date;
};
/** main connection for orders Operations*/
export declare let orderMain: Model<Torder>;
/** lean connection for orders Operations*/
export declare let orderLean: Model<Torder>;
/** primary selection object
 * for order
 */
/** */
export declare const orderSelect: {
    paymentRelated: number;
    invoiceRelated: number;
    deliveryDate: number;
};
/** */
export declare const createOrderModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
