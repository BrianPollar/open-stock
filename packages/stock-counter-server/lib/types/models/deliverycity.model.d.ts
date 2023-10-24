/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ideliverycity } from '@open-stock/stock-universal';
/** model type for deliverycity*/
/** */
export type Tdeliverycity = Document & Ideliverycity;
/** main connection for deliverycitys Operations*/
export declare let deliverycityMain: Model<Tdeliverycity>;
/** lean connection for deliverycitys Operations*/
export declare let deliverycityLean: Model<Tdeliverycity>;
/** primary selection object
 * for deliverycity
 */
/** */
export declare const deliverycitySelect: {
    name: number;
    shippingCost: number;
    currency: number;
    deliversInDays: number;
};
/** */
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export declare const createDeliverycityModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
