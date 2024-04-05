/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { IsubscriptionPackage } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
export type TsubscriptionPackage = Document & IsubscriptionPackage;
/**
 * Represents the main subscription package model.
 */
export declare let subscriptionPackageMain: Model<TsubscriptionPackage>;
/**
 * Represents a lean subscription package model.
 */
export declare let subscriptionPackageLean: Model<TsubscriptionPackage>;
/**
 * Selects the subscriptionPackageselect constant from the subscriptionPackage.model module.
 */
export declare const subscriptionPackageSelect: {
    name: number;
    ammount: number;
    duration: number;
    active: number;
    features: number;
};
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createSubscriptionPackageModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
