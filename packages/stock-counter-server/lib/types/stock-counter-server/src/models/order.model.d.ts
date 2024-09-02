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
    isDeleted?: boolean;
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
