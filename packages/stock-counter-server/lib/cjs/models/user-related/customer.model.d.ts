/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Icustomer } from '@open-stock/stock-universal';
/** Represents a customer in the system. */
export type Tcustomer = Document & Icustomer;
/** The main connection for customer operations. */
export declare let customerMain: Model<Tcustomer>;
/** The lean connection for customer operations. */
export declare let customerLean: Model<Tcustomer>;
/** Defines the primary selection object for customer. */
export declare const customerSelect: {
    user: number;
    salutation: number;
    endDate: number;
    occupation: number;
    otherAddresses: number;
};
/**
 * Creates a new customer model and connects to the database.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection.
 * @param lean Whether to create the lean connection.
 */
export declare const createCustomerModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
