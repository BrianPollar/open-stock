/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Icustomer } from '@open-stock/stock-universal';
/** model type for customer*/
/** */
export type Tcustomer = Document & Icustomer;
/** main connection for customers Operations*/
export declare let customerMain: Model<Tcustomer>;
/** lean connection for customers Operations*/
export declare let customerLean: Model<Tcustomer>;
/** primary selection object
 * for customer
 */
/** */
export declare const customerSelect: {
    user: number;
    salutation: number;
    endDate: number;
    occupation: number;
    otherAddresses: number;
};
/** */
export declare const createCustomerModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
