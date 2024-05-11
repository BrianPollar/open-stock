import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents an order in the system.
 */
export type Torder = Document & {
    companyId: string;
    paymentRelated: string | IpaymentRelated;
    invoiceRelated: string | IinvoiceRelated;
    deliveryDate: Date;
};
/**
 * Represents the main order model.
 */
export declare let orderMain: Model<Torder>;
/**
 * Represents a lean order model.
 */
export declare let orderLean: Model<Torder>;
/**
 * Represents the order select function.
 */
export declare const orderSelect: {
    companyId: number;
    paymentRelated: number;
    invoiceRelated: number;
    deliveryDate: number;
};
/**
 * Creates an order model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export declare const createOrderModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
