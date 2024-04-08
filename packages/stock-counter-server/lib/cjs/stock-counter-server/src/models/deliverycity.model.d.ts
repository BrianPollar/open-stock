/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Ideliverycity } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a delivery city.
 * @typedef {Document & Ideliverycity} Tdeliverycity
 */
export type Tdeliverycity = Document & Ideliverycity;
/**
 * Represents the main delivery city model.
 */
export declare let deliverycityMain: Model<Tdeliverycity>;
/**
 * Represents a variable that holds a lean model of the delivery city.
 */
export declare let deliverycityLean: Model<Tdeliverycity>;
/**
 * Represents the selection of delivery cities.
 */
export declare const deliverycitySelect: {
    companyId: number;
    name: number;
    shippingCost: number;
    currency: number;
    deliversInDays: number;
};
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export declare const createDeliverycityModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
