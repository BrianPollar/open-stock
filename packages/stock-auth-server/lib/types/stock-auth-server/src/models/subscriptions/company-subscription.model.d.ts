/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IcompanySubscription } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
export type TcompanySubscription = Document & IcompanySubscription;
/**
 * Represents the main company subscription model.
 */
export declare let companySubscriptionMain: Model<TcompanySubscription>;
/**
 * Represents a lean company subscription model.
 */
export declare let companySubscriptionLean: Model<TcompanySubscription>;
/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export declare const companySubscriptionSelect: {
    companyId: number;
    name: number;
    ammount: number;
    duration: number;
    active: number;
    subscriprionId: number;
    startDate: number;
    endDate: number;
    pesaPalorderTrackingId: number;
    status: number;
    features: number;
};
/**
 * Creates a new company subscription model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createCompanySubscription: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
