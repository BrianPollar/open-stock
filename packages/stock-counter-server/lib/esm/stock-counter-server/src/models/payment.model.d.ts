/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/schematypes" />
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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
/**
 * Represents a payment document.
 */
export type Tpayment = Document & {
    companyId: string | Schema.Types.ObjectId;
    paymentRelated: string | IpaymentRelated;
    invoiceRelated: string | IinvoiceRelated;
    order: string;
    isDeleted?: boolean;
};
/**
 * Represents the main payment model.
 */
export declare let paymentMain: Model<Tpayment>;
/**
 * Represents a lean payment model.
 */
export declare let paymentLean: Model<Tpayment>;
/**
 * Represents a payment select function.
 */
export declare const paymentSelect: {
    companyId: number;
    paymentRelated: number;
    invoiceRelated: number;
    order: number;
};
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export declare const createPaymentModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
