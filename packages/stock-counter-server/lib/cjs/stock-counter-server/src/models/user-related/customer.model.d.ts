import { Icustomer } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a customer document in the database.
 */
export type Tcustomer = Document & Icustomer;
/**
 * The main customer model.
 */
export declare let customerMain: Model<Tcustomer>;
/**
 * Represents a lean customer model.
 */
export declare let customerLean: Model<Tcustomer>;
/**
 * Represents a customer select statement.
 */
export declare const customerSelect: {
    companyId: number;
    user: number;
    salutation: number;
    endDate: number;
    occupation: number;
    otherAddresses: number;
};
/**
 * Creates a new customer model and connects to the database.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection.
 * @param lean Whether to create the lean connection.
 */
export declare const createCustomerModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
