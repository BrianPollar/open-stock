/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IcompanySubscription } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
export type TcompanySubscription = Document & IcompanySubscription;
/**
 * Represents the main FAQ model.
 */
export declare let companySubscriptionMain: Model<TcompanySubscription>;
/**
 * Represents a lean FAQ model.
 */
export declare let companySubscriptionLean: Model<TcompanySubscription>;
/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export declare const companySubscriptionSelect: {
    companyId: number;
    active: number;
    subscriprionId: number;
    startDate: number;
    endDate: number;
    features: number;
};
/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createSubscriptionPackageModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
